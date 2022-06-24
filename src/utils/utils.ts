export const replaceAttributesWithClassName = (
  articleDom: DocumentFragment,
  selector: string,
  newClass?: string,
): void => {
  Array.from(articleDom.querySelectorAll(selector)).forEach((element) => {
    element.removeAttribute('itemprop');
    element.removeAttribute('itemtype');
    element.removeAttribute('data-itemprop');
    element.removeAttribute('itemscope');
    if (newClass) {
      element.classList.add(newClass);
    }
  });
};
