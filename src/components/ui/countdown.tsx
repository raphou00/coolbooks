"use client";

import { useEffect, useState } from "react";

type CountdownProps = {
    time: number;
    action: () => void;
};

const Countdown: React.FC<CountdownProps> = ({ time, action }) => {
    const [count, setCount] = useState<number>(time);

    useEffect(() => {
        if (count <= 0) action();
        else setTimeout(() => setCount(count - 1), 1000);
    }, [action, count]);

    return (
        <span className="countdown font-mono text-2xl text-primary">
            <span style={{ "--value": count } as React.CSSProperties}></span>
        </span>
    );
};

export default Countdown;
