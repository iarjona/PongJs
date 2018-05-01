function generateRandomColor() {
    return (function (math, a, b) {
        return (b ? arguments.callee(math, a, b - 1) : '#') +
            a[math.floor(math.random() * a.length)]
    })(Math, '0123456789ABCDEF', 5);
}

function showAlertWithDelay(msgText, delay) {
    showNoty("alert", msgText, delay);
}

function showInfoWithDelay(msgText, delay) {
    showNoty("info", msgText, delay);
}

function showSuccessWithDelay(msgText, delay) {
    showNoty("warning", msgText, delay);
}

function showWarningWithDelay(msgText, delay) {
    showNoty("warning", msgText, delay);
}

function showErrorWithDelay(msgText, delay) {
    showNoty("error", msgText, delay);
}

function showNoty(notyType, msgText, delay) {
    new Noty({
        type: notyType,
        layout: 'topCenter',
        theme: 'metroui',
        text: msgText,
        timeout: delay,
        progressBar: false
    }).show();
}

function getConfirmationWithDelay(msgText, delay, confirmCallback, denyCallback) {
    if (denyCallback) {
        return new Noty({
            text: msgText,
            type: 'info',
            layout: 'topCenter',
            theme: 'metroui',
            timeout: delay,
            progressBar: true,
            buttons: [
                Noty.button('Yes', 'btn btn-success', confirmCallback),
                Noty.button('No', 'btn btn-error', denyCallback)
            ]
        });
    } else {
        return new Noty({
            text: msgText,
            type: 'info',
            layout: 'topCenter',
            theme: 'metroui',
            timeout: delay,
            progressBar: true,
            buttons: [
                Noty.button('Yes', 'btn btn-success', confirmCallback)
            ]
        });
    }
}