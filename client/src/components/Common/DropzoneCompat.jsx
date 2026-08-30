import React, {forwardRef, useImperativeHandle} from 'react';
import {useDropzone} from 'react-dropzone';

const DropzoneCompat = forwardRef(function DropzoneCompat(
    {children, className, disableClick, inputProps, align, ...options},
    ref,
) {
    const dropzone = useDropzone({...options, noClick: disableClick});
    useImperativeHandle(ref, () => ({open: dropzone.open}), [dropzone.open]);
    const content = typeof children === 'function' ? children(dropzone) : children;
    return <div {...dropzone.getRootProps({className, style: align ? {textAlign: align} : undefined})}>
        <input {...dropzone.getInputProps(inputProps)} />
        {content}
    </div>;
});

export default DropzoneCompat;
