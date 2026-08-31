export function browserElementById<Element extends HTMLElement = HTMLElement>(id: string): Element | null {
    return document.getElementById(id) as Element | null;
}
