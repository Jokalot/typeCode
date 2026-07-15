import { useState, useRef, useCallback, useEffect } from 'react';

type CharState = 'pending' | 'correct' | 'wrong';
type Mode = 'speed' | 'learn';

interface Options {
    code: string;
    mode: Mode;
    timeLimit: number;
    onFinish?: (stats: { wpm: number; accuracy: number; errors: number }) => void;
}

export function useTypingEngine({ code, mode, timeLimit, onFinish }: Options) {
    const chars = code.split('');

    const [charStates, setCharStates] = useState<CharState[]>(
        new Array(chars.length).fill('pending')
    );
    const [cursor, setCursor] = useState(0);
    const [errors, setErrors] = useState(0);
    const [totalTyped, setTotalTyped] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);

    const startTimeRef = useRef<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const cursorRef = useRef(cursor);
    const charStatesRef = useRef(charStates);
    const errorsRef = useRef(errors);
    const totalTypedRef = useRef(totalTyped);
    const finishedRef = useRef(finished);

    // Mantén las refs sincronizadas para usarlas dentro de closures
    useEffect(() => { cursorRef.current = cursor; }, [cursor]);
    useEffect(() => { charStatesRef.current = charStates; }, [charStates]);
    useEffect(() => { errorsRef.current = errors; }, [errors]);
    useEffect(() => { totalTypedRef.current = totalTyped; }, [totalTyped]);
    useEffect(() => { finishedRef.current = finished; }, [finished]);

    const accuracy = totalTyped > 0
        ? Math.round(((totalTyped - errors) / totalTyped) * 100)
        : 100;

    const progress = chars.length > 0
        ? Math.round((cursor / chars.length) * 100)
        : 0;

    // ── Limpia ambos intervalos ──
    const clearTimers = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
    }, []);

    // ── Calcula el WPM final y llama onFinish ──
    // DESPUÉS — endGame ya NO llama onFinish
    const endGame = useCallback(() => {
        clearTimers();
        const elapsed = startTimeRef.current
            ? (Date.now() - startTimeRef.current) / 1000 / 60
            : 0;
        const finalWpm = elapsed > 0
            ? Math.round((totalTypedRef.current / 5) / elapsed)
            : 0;
        setWpm(finalWpm);
        setFinished(true);
    }, [clearTimers]);

    // Nuevo efecto — llama onFinish DESPUÉS del render, cuando finished es true
    useEffect(() => {
        if (!finished) return;
        const elapsed = startTimeRef.current
            ? (Date.now() - startTimeRef.current) / 1000 / 60
            : 0;
        const finalWpm = elapsed > 0
            ? Math.round((totalTypedRef.current / 5) / elapsed)
            : 0;
        onFinish?.({
            wpm: finalWpm,
            accuracy: totalTypedRef.current > 0
                ? Math.round(((totalTypedRef.current - errorsRef.current) / totalTypedRef.current) * 100)
                : 100,
            errors: errorsRef.current,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finished]);

    // ── Arranca timers al primer keystroke ──
    const startTimers = useCallback(() => {
        startTimeRef.current = Date.now();

        // WPM en tiempo real cada 300ms
        timerRef.current = setInterval(() => {
            if (!startTimeRef.current) return;
            const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
            const currentWpm = elapsed > 0
                ? Math.round((totalTypedRef.current / 5) / elapsed)
                : 0;
            setWpm(currentWpm);
        }, 300);

        // Countdown solo en modo speed
        if (mode === 'speed') {
            countdownRef.current = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        endGame();
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
    }, [mode, endGame]);

    // ── Reset completo ──
    const reset = useCallback(() => {
        clearTimers();
        startTimeRef.current = null;
        setCharStates(new Array(chars.length).fill('pending'));
        setCursor(0);
        setErrors(0);
        setTotalTyped(0);
        setWpm(0);
        setTimeLeft(timeLimit);
        setStarted(false);
        setFinished(false);
    }, [clearTimers, chars.length, timeLimit]);

    // ── Reset automático si cambia el código o timeLimit ──
    useEffect(() => {
        reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code, timeLimit]);

    // ── Limpieza al desmontar ──
    useEffect(() => () => clearTimers(), [clearTimers]);

    // ── Procesa un carácter tipeado (teclado físico o virtual) ──
    const handleChar = useCallback((actual: string) => {
        if (finishedRef.current) return;
        if (actual.length !== 1 && actual !== '\n') return;

        const pos = cursorRef.current;
        if (pos >= chars.length) return;

        if (!started) {
            setStarted(true);
            startTimers();
        }

        const expected = chars[pos];
        const isCorrect = actual === expected;

        setCharStates(prev => {
            const next = [...prev];
            next[pos] = isCorrect ? 'correct' : 'wrong';
            return next;
        });

        setTotalTyped(t => { totalTypedRef.current = t + 1; return t + 1; });
        if (!isCorrect) setErrors(e => { errorsRef.current = e + 1; return e + 1; });

        const nextPos = pos + 1;
        setCursor(nextPos);
        cursorRef.current = nextPos;

        if (nextPos >= chars.length) endGame();
    }, [started, chars, startTimers, endGame]);

    // ── Borra el último carácter tipeado ──
    const handleBackspace = useCallback(() => {
        if (finishedRef.current) return;
        const pos = cursorRef.current;
        if (pos === 0) return;
        setCharStates(prev => {
            const next = [...prev];
            next[pos - 1] = 'pending';
            return next;
        });
        setCursor(pos - 1);
        cursorRef.current = pos - 1;
    }, []);

    return {
        // Estado
        charStates,
        cursor,
        errors,
        totalTyped,
        wpm,
        accuracy,
        progress,
        timeLeft,
        started,
        finished,
        // Acciones
        handleChar,
        handleBackspace,
        reset,
    };
}