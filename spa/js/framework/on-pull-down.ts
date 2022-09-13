// Adapted from https://stackoverflow.com/a/46248086/5235303

const pStart = { x: 0, y: 0 }
const pStop = { x: 0, y: 0 }

let callback: (() => void) | undefined

function swipeStart(e: DragEvent | TouchEvent) {
    if ('targetTouches' in e) {
        const touch = e.targetTouches[0]
        pStart.x = touch.screenX
        pStart.y = touch.screenY
    } else {
        pStart.x = e.screenX
        pStart.y = e.screenY
    }
}

function swipeEnd(e: DragEvent | TouchEvent) {
    if ('targetTouches' in e) {
        const touch = e.changedTouches[0]
        pStop.x = touch.screenX
        pStop.y = touch.screenY
    } else {
        pStop.x = e.screenX
        pStop.y = e.screenY
    }

    swipeCheck()
}

function swipeCheck() {
    const changeY = pStart.y - pStop.y
    const changeX = pStart.x - pStop.x
    if (isPullDown(changeY, changeX)) {
        callback?.()
    }
}

function isPullDown(dY: number, dX: number) {
    // methods of checking slope, length, direction of line created by swipe action
    return (
        dY < 0 &&
        ((Math.abs(dX) <= 100 && Math.abs(dY) >= 300) ||
            (Math.abs(dX) / Math.abs(dY) <= 0.3 && dY >= 60))
    )
}

document.addEventListener(
    'touchstart',
    function (e) {
        swipeStart(e)
    },
    false
)
document.addEventListener(
    'touchend',
    function (e) {
        swipeEnd(e)
    },
    false
)

export default function onPullDown(cb?: () => void) {
    callback = cb
}