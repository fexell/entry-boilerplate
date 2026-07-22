using System.Text;
using System.Text.RegularExpressions;

namespace Audwio.Projects
{
  public static class SlugHelper
  {
    public static string Slugify(string input)
    {
      var lowered = input.Trim().ToLowerInvariant();
      var withHyphens = Regex.Replace(lowered, @"[^a-z0-9]+", "-");
      var trimmed = withHyphens.Trim('-');

      return string.IsNullOrEmpty(trimmed) ? "project" : trimmed;
    }
  }
}