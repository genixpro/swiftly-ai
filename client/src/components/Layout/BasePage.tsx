import type {PropsWithChildren} from 'react';

export default function BasePage({children}: PropsWithChildren) {
    return <div className="wrapper">{children}</div>;
}
