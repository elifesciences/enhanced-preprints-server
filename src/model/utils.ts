/*
 * Titles will be a simple string, but the XML -> JSON conversion can leave either a string,
 * or an array of either strings or objects with additional formatting information (e.g. emphasis)
 * This will take any of these forms (and additionally will attempt to decode a JSON string)
 */
export const normaliseTitleJson = (title: Title): string => {
  if (typeof title == "string") {
    try {
      return normaliseTitleJson(JSON.parse(title));
    } catch {
      //just an ordinary string
      return title;
    }
  }

  title = title.map((titlePart) => {
    if (typeof titlePart == "string") {
      return titlePart;
    }
    return normaliseTitleJson(titlePart?.content);
  });

  return title.join('');
};

type DecoratedContent = {
  content: string,
  type: string,
};

type TitlePart = string|DecoratedContent;
type Title = string|TitlePart[];
