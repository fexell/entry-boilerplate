using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Entry.Auth.Filters
{
  public class ValidationFilter : IActionFilter
  {
    public void OnActionExecuting(ActionExecutingContext context)
    {
      if (!context.ModelState.IsValid)
      {
        var errors = context.ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)
            .ToList();

        context.Result = new BadRequestObjectResult(new
        {
          message = "Invalid input.",
          errors
        });
      }
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
  }
}
