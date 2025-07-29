// Countdown Timer Upselling
(function () {
  const second = 1000,
    minute = second * 60,
    hour = minute * 60,
    day = hour * 24;

  let countDownDate = new Date();
  countDownDate.setTime(countDownDate.getTime() + (2 * 60 * 60 * 1000));

  const countDown = countDownDate.getTime(),
    x = setInterval(function () {

      const now = new Date().getTime(),
        distance = countDown - now;

      if (distance < 0) {
        document.getElementById("countdown").style.display = "none";
        document.getElementById("content").style.display = "block";
        clearInterval(x);
      } else {
        const hoursElem = document.getElementById("hours");
        const minutesElem = document.getElementById("minutes");
        const secondsElem = document.getElementById("seconds");
        if (hoursElem && minutesElem && secondsElem) {
          hoursElem.innerText = Math.floor((distance % (day)) / (hour));
          minutesElem.innerText = Math.floor((distance % (hour)) / (minute));
          secondsElem.innerText = Math.floor((distance % (minute)) / second);
        }
      }
      }
    , 0)
}());


