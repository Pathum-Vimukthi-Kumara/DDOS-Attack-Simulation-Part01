function player() {
    const path = `${location.pathname === '/' ? '' : '../'}assets/audios/`
    const audios = {
        move: new Audio(path + 'move.mp3'),
        capture: new Audio(path + 'capture.mp3'),
        castle: new Audio(path + 'castle.mp3'),
        start: new Audio(path + 'start.mp3'),
        end: new Audio(path + 'gameover.mp3'),
    }

    const vol = 1
    audios.move.volume = vol
    audios.capture.volume = vol
    audios.castle.volume = vol
    audios.start.volume = vol
    audios.end.volume = vol

    function move() {
        audios.move.play().catch(e => console.log('Audio play interrupted:', e.message))
    }

    function capture() {
        audios.capture.play().catch(e => console.log('Audio play interrupted:', e.message))
    }

    function castle() {
        audios.castle.play().catch(e => console.log('Audio play interrupted:', e.message))
    }

    function start() {
        audios.start.play().catch(e => console.log('Audio play interrupted:', e.message))
    }

    function end() {
        audios.end.play().catch(e => console.log('Audio play interrupted:', e.message))
    }

    function stop() {
        audios.move.pause()
        audios.capture.pause()
        audios.castle.pause()
        audios.start.pause()
        audios.end.pause()
    }

    return {
        move,
        capture,
        castle,
        stop,
        end,
        start
    }
}

export const play = player()