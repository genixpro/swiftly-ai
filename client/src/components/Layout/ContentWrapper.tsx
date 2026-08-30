import type {PropsWithChildren} from 'react';

interface ContentWrapperProps extends PropsWithChildren {
    unwrap?: boolean;
}

export default function ContentWrapper({children, unwrap = false}: ContentWrapperProps) {
    return <div className="content-wrapper">{unwrap ? <div className="unwrap">{children}</div> : children}</div>;
}
