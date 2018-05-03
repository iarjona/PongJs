function startOfflineWithAI(isAIEnabled) {
    configureOffline();

    drawGame();
    startGameLoopAfterTimeout(function () {
        return calculateOffline(isAIEnabled);
    }, waitForNewRound);
}

function configureOffline() {
    leftPadPosX = 0;
    leftPadPosY = $("#gameContainer")[0].height / 2 - padHeight / 2;
    rightPadPosX = $("#gameContainer")[0].width - blockSize;
    rightPadPosY = leftPadPosY;
    ballPosX = $("#gameContainer")[0].width / 2;
    ballPosY = $("#gameContainer")[0].height / 2;
}

function calculateOffline(isAIEnabled) {
    if (keyWPressed) leftPadPosY -= padSpeed;
    if (keySPressed) leftPadPosY += padSpeed;
    if (isAIEnabled) {
        calculateNextAIMove();
    } else {
        if (keyUpPressed) rightPadPosY -= padSpeed;
        if (keyDownPressed) rightPadPosY += padSpeed;
    }

    if (rightPadPosY <= blockSize) rightPadPosY = blockSize;
    if (rightPadPosY + padHeight >= $("#gameContainer")[0].height - blockSize) rightPadPosY = $("#gameContainer")[0].height - blockSize - padHeight;
    if (leftPadPosY <= blockSize) leftPadPosY = blockSize;
    if (leftPadPosY + padHeight >= $("#gameContainer")[0].height - blockSize) leftPadPosY = $("#gameContainer")[0].height - blockSize - padHeight;

    if (ballPosY - ballSize <= blockSize || ballPosY + ballSize >= $("#gameContainer")[0].height - blockSize) ballIncrementY *= -1;

    var collisionOnRight = ballPosX + ballSize >= $("#gameContainer")[0].width - blockSize;
    var collisionOnLeft = ballPosX - ballSize <= blockSize;
    var isGoalOnRight = rightPadPosY > ballPosY || rightPadPosY + padHeight < ballPosY;
    var isGoalOnLeft = leftPadPosY > ballPosY || leftPadPosY + padHeight < ballPosY;

    var goal = false;
    if (collisionOnRight && isGoalOnRight) {
        goal = true;
        playerOneScore++;
        showAlertWithDelay("Goal for player one!", 1000);
    } else if (collisionOnLeft && isGoalOnLeft) {
        goal = true;
        playerTwoScore++;
        isAIEnabled ? showAlertWithDelay("The computer is owning you!", 1000) : showAlertWithDelay("Goal for player two!", 1000);
    } else if ((collisionOnRight && !isGoalOnRight) || (collisionOnLeft && !isGoalOnLeft)) {
        noGoalHitsCount++;

        if (noGoalHitsCount == noGoalHitsToSpeedUp) {
            noGoalHitsCount = 0;
            speedIncrement += 0.5;
            showWarningWithDelay("Game speed increased! [" + speedIncrement * 100 + " %]", 1000);
        }
    }

    if (collisionOnRight || collisionOnLeft) {
        ballIncrementX *= -1;
    }

    if (goal) {
        noGoalHitsCount = 0;
        speedIncrement = 1.0;
        ballPosX = $("#gameContainer")[0].width / 2;

        startGameLoopAfterTimeout(function () {
            return calculateOffline(isAIEnabled);
        }, waitForNewRound);
    } else {
        ballPosX += ballIncrementX * speedIncrement;
        ballPosY += ballIncrementY * speedIncrement;

        if (ballPosY + ballSize >= $("#gameContainer")[0].height - blockSize) ballPosY = $("#gameContainer")[0].height - blockSize - ballSize;
        else if (ballPosY - ballSize <= blockSize) ballPosY = blockSize + ballSize;
        if (ballPosX + ballSize >= $("#gameContainer")[0].width - blockSize) ballPosX = $("#gameContainer")[0].width - blockSize - ballSize;
        else if (ballPosX - ballSize <= blockSize) ballPosX = blockSize + ballSize;
    }
}

function calculateNextAIMove() {
    //TODO Do a real AI.
    rightPadPosY = ballPosY - padHeight / 2;
}