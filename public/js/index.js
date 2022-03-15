const carouselSlide = document.querySelector(".carousel__slide");
const carouselImages = document.querySelectorAll(".carousel__slide a");

// Buttons Prev and Next
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// Counter
let counter = 0;
let amountShow = 3;
let counterMax = carouselImages.length / amountShow - 1;
const size = carouselImages[0].clientWidth * amountShow;

// Buttons Listener
nextBtn.addEventListener("click", () => {
  counter++;
  prevBtn.removeAttribute("disabled");
  if (counter >= counterMax) {
    nextBtn.setAttribute("disabled", "true");
    carouselSlide.style.transform = `translateX(${-size * counter}px)`;
    return;
  } else {
    nextBtn.removeAttribute("disabled");
  }
  carouselSlide.style.transform = `translateX(${-size * counter}px)`;
});

prevBtn.addEventListener("click", () => {
  counter--;
  nextBtn.removeAttribute("disabled");
  if (counter <= 0) {
    prevBtn.setAttribute("disabled", "true");
    carouselSlide.style.transform = `translateX(${-size * counter}px)`;
    return;
  } else {
    prevBtn.removeAttribute("disabled");
  }
  carouselSlide.style.transform = `translateX(${-size * counter}px)`;
});
