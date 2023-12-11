carousels.productOfTheDayCarousel1 = function(){
  $('.carousel.product-of-the-day-carousel-1')
    .on('initialized.owl.carousel',function(event){
      $(event.currentTarget).velocity({
        opacity: 1
      },{
        duration: 50
      });
    })
    .on('initialized.owl.carousel changed.owl.carousel refreshed.owl.carousel',function(event){
      if(!event.namespace){ return; }

      var carousel = event.relatedTarget,
          element = event.target,
          current = carousel.current();

      $('.owl-next',element).toggleClass('disabled',current === carousel.maximum() || carousel.maximum() === -1);
      $('.owl-prev',element).toggleClass('disabled',current === carousel.minimum());
    })
    .owlCarousel({
      loop: false,
      margin: 30,
      nav: true,
      dots: false,
      navText: ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
      responsive: {
        0: {
          items: 1
        }
      }
    });
}

carousels.productOfTheDayCarousel1();
