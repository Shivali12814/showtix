var slideIndex = 1;
var autoTimer = null;

showSlides(slideIndex);
startAuto();

function plusSlides(n) {
  resetAuto();
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  resetAuto();
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var slides = document.getElementsByClassName('mySlides');
  var dots   = document.getElementsByClassName('dot');
  if (!slides.length) return;

  if (n > slides.length) slideIndex = 1;
  if (n < 1)             slideIndex = slides.length;

  for (var i = 0; i < slides.length; i++) {
    slides[i].style.display = 'none';
    slides[i].classList.remove('active-slide');
  }
  for (var i = 0; i < dots.length; i++) {
    dots[i].classList.remove('active');
  }

  slides[slideIndex - 1].style.display = 'block';
  // small delay so the CSS transition fires after display:block
  setTimeout(function() {
    slides[slideIndex - 1].classList.add('active-slide');
  }, 20);

  if (dots[slideIndex - 1]) dots[slideIndex - 1].classList.add('active');
}

function startAuto() {
  autoTimer = setInterval(function() {
    slideIndex++;
    showSlides(slideIndex);
  }, 4500);
}

function resetAuto() {
  clearInterval(autoTimer);
  startAuto();
}
