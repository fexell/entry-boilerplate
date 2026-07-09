using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Entry.Auth.Filters
{
  public class AntiforgeryFilter : IAsyncActionFilter
  {
    private static readonly HashSet<string> SafeMethods = new(StringComparer.OrdinalIgnoreCase)
    {
      "GET", "HEAD", "OPTIONS", "TRACE"
    };

    private const string HeaderName = "X-CSRF-TOKEN";

    private readonly IAntiforgery _antiforgery;

    public AntiforgeryFilter(IAntiforgery antiforgery)
    {
      _antiforgery = antiforgery;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
      var request = context.HttpContext.Request;

      if (SafeMethods.Contains(request.Method))
      {
        await next();
        return;
      }

      var isAnonymous = context.ActionDescriptor.EndpointMetadata
        .OfType<IAllowAnonymous>()
        .Any();

      if (isAnonymous)
      {
        await next();
        return;
      }

      // Kolla headern innan vi ens anropar ramverket. Om vi hoppar över det
      // här och headern saknas, faller ValidateRequestAsync tillbaka på att
      // läsa Request.Form - vilket kastar ett oskyddat InvalidOperationException
      // för JSON-requests (fel Content-Type) och kraschar med 500 istället
      // för att ge ett rent 403-svar.
      if (!request.Headers.ContainsKey(HeaderName))
      {
        context.Result = Forbidden();
        return;
      }

      try
      {
        await _antiforgery.ValidateRequestAsync(context.HttpContext);
      }
      catch (Exception)
      {
        // Fångar AntiforgeryValidationException (fel/saknad token) och alla
        // andra fel ramverket kan kasta internt - CSRF-fel ska alltid ge ett
        // rent 403, aldrig en oskyddad 500.
        context.Result = Forbidden();
        return;
      }

      await next();
    }

    private static ObjectResult Forbidden() =>
      new(new { message = "Invalid or missing CSRF token.", code = "CSRF_TOKEN_INVALID" })
      {
        StatusCode = StatusCodes.Status403Forbidden
      };
  }
}
