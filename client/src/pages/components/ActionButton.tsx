import type {ReactNode} from 'react';
import {useEffect, useRef, useState} from 'react';
import {Button, type ButtonProps} from 'reactstrap';

interface ActionButtonProps extends Omit<ButtonProps, 'onClick'> {
    children?: ReactNode;
    onClick(): Promise<unknown>;
}

export default function ActionButton({children, onClick, ...buttonProps}: ActionButtonProps) {
    const [loading, setLoading] = useState(false);
    const [showingSuccess, setShowingSuccess] = useState(false);
    const [showingFailure, setShowingFailure] = useState(false);
    const timers = useRef<number[]>([]);

    useEffect(() => () => timers.current.forEach(timer => window.clearTimeout(timer)), []);

    const scheduleResult = (startedAt: number, success: boolean) => {
        const delay = Math.max(1, 500 - (Date.now() - startedAt));
        timers.current.push(window.setTimeout(() => {
            setLoading(false);
            setShowingSuccess(success);
            setShowingFailure(!success);
            timers.current.push(window.setTimeout(() => {
                setLoading(false);
                setShowingSuccess(false);
                setShowingFailure(false);
            }, 2000));
        }, delay));
    };

    const performAction = () => {
        const startedAt = Date.now();
        const promise = onClick();
        setLoading(true);
        setShowingSuccess(false);
        promise.then(() => scheduleResult(startedAt, true), () => scheduleResult(startedAt, false));
    };

    return <Button {...buttonProps} onClick={performAction} className="action-button">
        {loading ? <div className="button-loading-wrapper">
            <span className="children">{children}</span>
            <div className="loader-wrapper"><div className="ball-pulse"><div /><div /><div /></div></div>
        </div> : <span className="contents">
            <span className="children"> {children}</span>
            {showingSuccess ? <i className="fa fa-check result" /> : null}
            {showingFailure ? <i className="fa fa-times result" /> : null}
        </span>}
    </Button>;
}
