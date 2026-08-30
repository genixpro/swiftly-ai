import type {PropsWithChildren} from 'react';

export default function Toolbar({children}: PropsWithChildren) {
    return <div id="toolbar" className="swiftly-toolbar">{children}</div>;
}
