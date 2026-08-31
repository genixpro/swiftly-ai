/** Opens the browser's native file picker and forwards the selected files once. */
export function chooseBrowserFiles(onFiles: (files: FileList) => void): void {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.addEventListener('change', () => {
        if (input.files) onFiles(input.files);
    }, {once: true});
    input.click();
}
