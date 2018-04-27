function generateRandomColor() {
    return (function (math, a, b) {
        return (b ? arguments.callee(math, a, b - 1) : '#') +
            a[math.floor(math.random() * a.length)]
    })(Math, '0123456789ABCDEF', 5);
}

function showAlertWithDelay(msgText, delay) {
    new Noty({
        type: 'alert',
        layout: 'topCenter',
        theme: 'metroui',
        text: msgText,
        timeout: delay,
        progressBar: false
    }).show();
}