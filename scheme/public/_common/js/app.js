document.documentElement.className += (('ontouchstart' in document.documentElement) ? 'touch' : 'no-touch');

var addEvent = function(object,type,callback){
  if(object == null || typeof(object) == 'undefined') return;
  if(object.addEventListener){
    object.addEventListener(type,callback,false);
  }else if(object.attachEvent){
    object.attachEvent('on' + type,callback);
  }else{
    object['on' + type] = callback;
  }
};

headerTopBarFormatter = function () {
  var header = document.getElementById('header'),
      topBar = document.querySelector('.top_bar')
  if(header == null || topBar == null){
    return false;
  }
  var data = {
    topBarInnerWrapper: header.querySelector('.top_bar_inner_wrapper'),
    topBarRight: header.querySelector('.top_bar_item.right'),
    hamburger: header.querySelector('.menu[data-action="inline"] li.hamburger'),
  }

  /* If right part of top bar wraps to the second line, then add class which centers it */
  function manageTopBarItemsCentering(data){
    if(data.topBarRight.offsetTop > 0){
      data.topBarInnerWrapper.classList.add('top_bar_center_items')
    }else{
      data.topBarInnerWrapper.classList.remove('top_bar_center_items')
    }
  };
  manageTopBarItemsCentering(data);
}

var headerMenuFormatter = function(minWidth,ignoredClass){
  var header = document.getElementById('header'),
      menu = header != null ? header.querySelector('.menu[data-action="inline"]') : null;

  if(header == null || menu == null || window.innerWidth < minWidth){
    return false;
  }

  if(menu.classList.contains('menu-calculate')){
    menu.classList.remove('menu-calculate');
  }

  var data = {
    elements: {
      menu: menu,
      stickyMenu: header.querySelector('.sticky-header_content__menu[data-action="inline"]'),
      hamburger: header.querySelector('.menu[data-action="inline"] li.hamburger'),
      stickyHamburger: header.querySelector('.sticky-header_content__menu[data-action="inline"] li.hamburger'),
      // All links elements
      links: header.querySelectorAll('.menu[data-action="inline"] > ul > li' + ['hamburger'].concat(typeof ignoredClass !== 'undefined' ? ignoredClass : undefined).filter(function(className){
        return className;
      }).map(function(className){
        return ':not(.' + className + ')';
      }).join('')),
      //Sticky links elements
      stickyLinks: header.querySelectorAll('.sticky-header_content__menu[data-action="inline"] > ul > li' + ['hamburger'].concat(typeof ignoredClass !== 'undefined' ? ignoredClass : undefined).filter(function(className){
        return className;
      }).map(function(className){
        return ':not(.' + className + ')';
      }).join('')),
      // Elements that must be show eq. search icon, expect hamburger element
      ignored: typeof ignoredClass !== 'undefined' ? header.querySelectorAll(ignoredClass.map(function(className){
        return '.menu[data-action="inline"] > ul > li.' + className;
      }).join(',')) : []
    },
    calculated: {
      menuWidth: 0,
      stickyMenuWidth: 0,
      linksWidth: 0,
      linksWidthCount: 0,
      stickyLinksWidth: 0,
      stickyLinksWidthCount: 0,
      ignoredWidth: 0,
      hamburgerWidth: 0,
      stickyHamburgerWidth: 0,
    }
  },
  calculateWidth = function(key,element){
    var width = element.getBoundingClientRect().width;
    if(typeof element.dataset.saveWidth === 'undefined'){
      element.dataset.saveWidth = width;
    }
    data.calculated[key] = Big(data.calculated[key]).plus(element.dataset.saveWidth);
  };

  [].forEach.call(data.elements.links,calculateWidth.bind(this,'linksWidth'));
  [].forEach.call(data.elements.stickyLinks,calculateWidth.bind(this,'stickyLinksWidth'));
  [].forEach.call(data.elements.ignored,calculateWidth.bind(this,'ignoredWidth'));

  data.calculated.menuWidth = data.elements.menu.getBoundingClientRect().width;
  data.calculated.hamburgerWidth = data.elements.hamburger.getBoundingClientRect().width;
  data.elements.hamburger.querySelector('.hambureger-elements').innerHTML = '';

  if(data.elements.stickyMenu){
    data.calculated.stickyMenuWidth = data.elements.stickyMenu.getBoundingClientRect().width;
    data.calculated.stickyHamburgerWidth = data.elements.stickyHamburger.getBoundingClientRect().width;
    data.elements.stickyHamburger.querySelector('.hambureger-elements').innerHTML = '';
  }

  if(Big(data.calculated.linksWidth).plus(data.calculated.ignoredWidth) > data.calculated.menuWidth){
    // Show hamburger, hide redundant links
    if(data.elements.hamburger.classList.contains('hidden')){
      data.elements.hamburger.classList.remove('hidden');
    }
    data.calculated.linksWidthCount = Big(data.calculated.ignoredWidth).plus(data.calculated.hamburgerWidth);

    [].forEach.call(data.elements.links,function(element,index){
      data.calculated.linksWidthCount = Big(data.calculated.linksWidthCount).plus(element.dataset.saveWidth);

      if(data.calculated.linksWidthCount > data.calculated.menuWidth){
        element.style.display = 'none';

        var cloneElement = data.elements.hamburger.querySelector('.hambureger-elements').appendChild(element.cloneNode(true));
            cloneElement.style.display = '';

        delete cloneElement.dataset.saveWidth;
      }else{
        element.style.display = '';
      }
    });
  }else{
    // Hide hamburger, show all links
    [].forEach.call(data.elements.links,function(element,index){
      element.style.display = '';
    });
    [].forEach.call(data.elements.stickyLinks,function(element,index){
      element.style.display = '';
    });
    if(!data.elements.hamburger.classList.contains('hidden') || !data.elements.stickyHamburger.classList.contains('hidden')){
      data.elements.hamburger.classList.add('hidden');
      data.elements.stickyHamburger.classList.add('hidden');
    }
  }
  if(Big(data.calculated.stickyLinksWidth).plus(data.calculated.hamburgerWidth) > data.calculated.stickyMenuWidth) {
    if (data.elements.stickyHamburger.classList.contains('hidden')){
      data.elements.stickyHamburger.classList.remove('hidden')
    }
    data.calculated.stickyLinksWidthCount = data.calculated.stickyHamburgerWidth;

    [].forEach.call(data.elements.stickyLinks,function(element,index){

      data.calculated.stickyLinksWidthCount = Big(data.calculated.stickyLinksWidthCount).plus(element.dataset.saveWidth);

      if(data.calculated.stickyLinksWidthCount.plus(data.calculated.hamburgerWidth) > data.calculated.stickyMenuWidth){
        element.style.display = 'none';

        var cloneElement = data.elements.stickyHamburger.querySelector('.hambureger-elements').appendChild(element.cloneNode(true));
        cloneElement.style.display = '';

        delete cloneElement.dataset.saveWidth;
      }else{
        element.style.display = '';
      }
    });
  }

};

$.fn.transition = function(type,duration,complete){
  var self = $(this),
      velocity = $(document).velocity,
      callback = false;

  if(typeof duration === 'undefined'){
    duration = 100;
  }

  if(typeof complete !== 'undefined'){
    callback = true;
  }

  if(typeof velocity !== 'undefined'){
    if(callback){
      self.velocity(type,{
        duration: duration,
        complete: complete.bind(self)
      });
    }else{
      self.velocity(type,{
        duration: duration
      });
    }
  }else{
    if(callback){
      self[type](duration,complete.bind(self));
    }else{
      self[type](duration);
    }
  }
};

var initializeSelect2 = function(element,params){
  if(typeof element === 'undefined'){
    element = $('.select-field-select2:not([data-initialize="false"])');
  }

  var defaultParams = {
    closeOnSelect: true,
    dropdownParent: null,
    selectLang: L['SELECT'],
    selectCallback: void 0
  };

  if(typeof params !== 'undefined'){
    Object.keys(params).forEach(function(key){
      defaultParams[key] = params[key];
    });

    params = defaultParams;
  }else{
    params = defaultParams;
  }

  element.select2({
    placeholder: true,
    width: '100%',
    theme: 'bootstrap',
    closeOnSelect: params.closeOnSelect,
    dropdownCssClass: 'select-field-select2-dropdown',
    minimumResultsForSearch: Infinity,
    dropdownParent: params.dropdownParent,
    language: {
      noResults: function(){
        return '<div class="select-field-select2-no-results"></div>';
      }
    },
    escapeMarkup: function(markup){
      return markup;
    }
  }).on('select2:open',function(){
    var self = $(this);

    $('.select2-search').find('input[type="search"]').prop('focus',false);
    $('.select2-results > ul').scrollbar();

    $('.select2-results').after($([
      '<div class="select2-set-params">',
        '<span>' + params.selectLang + '</span>',
      '</div>'
    ].join('')).on('click',function(){
      if(typeof params.selectCallback === 'undefined'){
        element.select2('close');
      }else{
        params.selectCallback({
          select: element,
          select2: self
        });
      }
    }));
  }).on('select2:closing',function(){
    $('.select2-results > ul').scrollbar('destroy');
  }).on('select2:select',function(e){
    $(this).children('option[value="' + $(this).val() + '"]').trigger('click');
  }).next().addClass('select-field-select2-container');
};

var escapeAttributeValue = function (text) {
  return text
      .replace(/"/g, '\u0022')
      .replace(/'/g, '\u0027');
};

var nettoToBrutto = function(value,tax){
  tax = isNaN(parseFloat(tax)) ? 0 : tax;

  return (Big(value).times(
    Big(
      Big(100).plus(tax)
    ).div(100)
  )).toFixed(2);
}

var bruttoToNetto = function(value,tax){
  tax = isNaN(parseFloat(tax)) ? 0 : tax;

  return (Big(value).minus(
    Big(
      Big(value).times(Big(tax).div(100))
    ).div(
      Big(Big(100).plus(tax)).div(100)
    )
  )).toFixed(2);
}

var stringPricesFormatter = function(value){
  var body = $('body'),
      symbol = body.attr('data-used').split('|')[1];

  if(symbol == '£' || symbol == '$'){
    symbol = symbol + value;
  }else{
    symbol = value + String.fromCharCode(160) + symbol;
  }

  return symbol;
};

var pricesFormatterData = {};

var pricesFormatter = function(selectors,update){
  var selector,
      data = $('body'),
      priceType = data.attr('data-hurt-price-type');

  if(priceType == 'netto' || priceType == 'netto_brutto'){
    priceType = L['NET'];
  }else if(priceType == 'brutto'){
    priceType = L['GROSS'];
  }

  if(typeof selectors === 'undefined' || selectors == '*'){
    selector = $('.core_priceFormat');
  }else if(typeof selectors === 'object'){
    selector = selectors.find('.core_priceFormat');
  }
  if(typeof update !== 'undefined' && update === true || Object.keys(pricesFormatterData).length == 0){
    var dataRates = {};

        data.attr('data-rates').split(',').forEach(function(c){
          var name = c.split(':')[0].replace(/'/g,''),
              rate = parseFloat(c.split(':')[1]) !== 1 ? Big(1).div(parseFloat(c.split(':')[1])).toFixed(4) : 1;

          dataRates[name] = rate;
        });

    pricesFormatterData = {
      money: {
        base: data.attr('data-base'),
        used: data.attr('data-used').split('|')[0],
        rates: dataRates
      },
      accounting: {
        symbol: data.attr('data-used').split('|')[1],
        format: data.attr('data-used').split('|')[1] == '£' || data.attr('data-used').split('|')[1] == '$' ? '%s%v' : '%v' + String.fromCharCode(160) + '%s',
        decimal: data.attr('data-decimal'),
    		thousand: data.attr('data-thousand') == ' ' ? String.fromCharCode(160) : data.attr('data-thousand'),
        precision: 2
      }
    };

    fx.base = pricesFormatterData.money.base;
    fx.rates = pricesFormatterData.money.rates;
    accounting.settings.currency = pricesFormatterData.accounting;
  }

  var priceTypeFormatter = function(price,element){
    var attr = element.attr('data-price-type');
    if(typeof attr !== 'undefined' && typeof attr.split('|')[1] !== 'undefined' && attr.split('|')[1] == 'show_type'){
      if(priceType.toLowerCase() == L['NET'].toLowerCase() && attr.split('|')[0] == 'brutto'){
        price = price + String.fromCharCode(160) + L['GROSS'] + String.fromCharCode(160);
      }else{
        price = price + String.fromCharCode(160) + priceType+String.fromCharCode(160);
      }
    }
    return price.trim();
  }

  selector.each(function(){
    var self = $(this),
        priceValue,
        price;
    // kwota obok koszyka, tekst dla niezalogowanych ucinamy
    if (typeof data.attr('data-hurt-price-text') !== 'undefined' && data.attr('data-hurt-price-text') && self.hasClass('core_quickCartTotalPrice')) {
      self.text(data.attr('data-hurt-price-text').substring(0, 20));
      return;
    }

    if (typeof data.attr('data-hurt-price-text') !== 'undefined' && data.attr('data-hurt-price-text')) {
      self.text(data.attr('data-hurt-price-text'));
      return;
    }

    if(self.data('price') === data.attr('data-hurt-price-text')){
      priceValue = parseFloat(self.data('price'));
    }else if (!isNaN(self.data('price'))){
      if(typeof self.attr('data-price-type') !== 'undefined' && (self.attr('data-price-type').split('|')[0] == 'netto' || self.attr('data-price-type').split('|')[0] == 'netto_brutto')){
        priceValue = bruttoToNetto(parseFloat(self.data('price')),self.data('tax'));
      }else{
        priceValue = parseFloat(self.data('price'));
      }
      price = accounting.formatMoney(fx.convert(priceValue,{
        from: pricesFormatterData.money.base,
        to: pricesFormatterData.money.used
      }));
    }

    if(isNaN(priceValue)){
      var config = accounting.settings.currency;

      if(typeof self.attr('data-tax') !== 'undefined' && data.attr('data-hurt-price-text') != ''){
        price = data.attr('data-hurt-price-text');
      }else{
        if(data.attr('data-used').split('|')[1] == '£' || data.attr('data-used').split('|')[1] == '$'){
          price = config.symbol + '-,--';
        }else{
          price = '-,--' + String.fromCharCode(160);// + config.symbol;
        }
      }
    }

    if(price && data.attr('data-decimal-hide') == 1){
      var config = accounting.settings.currency,
          symbol = data.attr('data-used').split('|')[1],
          based = price.split(config.decimal)[0],
          decimals = price.split(/,|\./).pop().split(String.fromCharCode(160))[0];
      if(decimals == '00'){
        if(data.attr('data-used').split('|')[1] == '£' || data.attr('data-used').split('|')[1] == '$'){
          based = price.split(/,|\./);
          based.pop();
          based = based.join(config.thousand);
          self.text(priceTypeFormatter(based,self));
        }else{
          based = price.split(/,|\./);
          based.pop();
          based = based.join(config.thousand);
          self.text(priceTypeFormatter(based + String.fromCharCode(160) + config.symbol,self));
        }
      }else{
        self.text(priceTypeFormatter(price,self));
      }
    }else {
      if (price) {
        self.text(priceTypeFormatter(price,self));
      } else if (data.attr('data-hurt-price-text')) {
        self.text(priceTypeFormatter(data.attr('data-hurt-price-text'),self));
      }
    }
  });
}

pricesFormatter();

var carousels = {};

$(document).on('ready mousewheel DOMMouseScroll scroll touchmove',function(e){
  var scrollTop = this.documentElement.scrollTop || this.body.scrollTop,
      toTop = $('#to-top');

  if(scrollTop > 500 && !toTop.hasClass('show')){
    toTop.addClass('show');
  }else if(scrollTop <= 500 && toTop.hasClass('show')){
    toTop.removeClass('show');
  }

});

$(document).on(' mousewheel DOMMouseScroll touchmove',function(e){
  if(document.activeElement.tagName === 'INPUT') {
    setTimeout(() =>{
      $(document.activeElement).eq(0).blur()
    },0)
  }
})


$('#to-top').on('click',function(){
  var toTop = $(this),
      scrollTop = $('html,body');

  scrollTop.animate({
    scrollTop: 0
  },'slow',function(){
    toTop.removeClass('show');
  });
});

$(document).on('click','[data-select-currency]',function(e){
  e.preventDefault();

  var self = $(this),
      used = self.data('select-currency'),
      body = $('body'),
      actives = $('[data-select-currency-active]'),
      currencyName = $('[data-select-currency-name]');

	body.attr('data-used',used);
	currencyName.text(used.split('|')[0]);
	actives.removeClass('active');

	cookies.create('currency',used.split('|')[0],365 * 24 * 60 * 60 * 1000);

  if(typeof self.attr('data-select-currency-active') !== 'undefined'){
    self.addClass('active');
  }else{
    self.parents('[data-select-currency-active]').addClass('active');
  }

  pricesFormatter('*',true);
});

$('#header')
  .on('focus','.input-field[name="q"]',function(){
    var self = $(this);

    if(self.parents('li.search').length > 0 && !self.parents('li.search').hasClass('click')){
      self.parents('li.search').addClass('click clicked');
      self.one('blur',function(){
        var self = $(this);

        if(self.parents('li.search').length > 0){
          self.parents('li.search').removeClass('click clicked');
        }
      });
    }
  });

var cartUpdateAjax = null;
var cartUpdateXhr;

var specialCharacterNameToReplace = function (prodName) {
  let stringToEncode = prodName

  if (prodName.includes('$&amp;')) {
    stringToEncode = stringToEncode.replace(/\$\&amp;/g, '&#36&#38')
  } else if (prodName.includes('$&')) {
    stringToEncode = stringToEncode.replace(/\$\&/g, '&#36&#38')
  }

  return stringToEncode
}

var cartUpdate = function(params,callback){
  var defaultParams = {
    wait: 100,
    blockade: 0,
    hash: null,
    rendered: null
  };

  if(typeof params !== 'undefined'){
    Object.keys(params).forEach(function(key){
      defaultParams[key] = params[key];
    });

    params = defaultParams;
  }else{
    params = defaultParams;
  }
  if(params.hash !== null){
    params.hash.forEach(function(hash){
      if(SkyShop.cart.ajaxHash.indexOf(hash) == -1){
        SkyShop.cart.ajaxHash.push(hash);
      }
    });

    params.hash = SkyShop.cart.ajaxHash;
  }

  var cart = $('.cart'),
      body = $('body');

  var data = {
    security: {
      countAjax: 0,
      maxAjax: 5
    },
    shop: {
      pricesType: typeof body.data('hurt-price-type') === 'undefined' || body.data('hurt-price-type') == '' || body.data('hurt-price-type') == 'brutto' ? 'gross' : 'net'
    }
  };

  var elements = {
    submit: cart.find('[type="submit"]'),
    loader: cart.find('.cart-loader'),
    products: {
      pattern: cart.find('.product-item-pattern'),
      patternOptions: cart.find('.product-item-pattern').find('.product-parameters-pattern'),
      table: cart.find('.cart-table'),
      tableBody: cart.find('.cart-table').children('tbody'),
      all: () => elements.products.tableBody.find('[data-hash]:not(.product-item-pattern)'),
      hashes: () => $.map(elements.products.all(), el => $(el).data('hash')),
      current: function(hash){
        var productElement = elements.products.tableBody.find('tr[data-hash="' + hash + '"]');

        return {
          el: productElement,
          prices: {
            price: productElement.find('.core_cartItemPrice'),
            priceDiscount: productElement.find('.core_cartItemPriceDiscount'),
            priceTotal: productElement.find('.core_cartItemPriceTotal')
          },
          parameters: {
            inline: productElement.find('.product-parameters-inline')
          },
          amountField: productElement.find('.core_storeCartProductAmount')
        };
      }
    },
    code: {
      value: cart.find('input[name="code_discount"]'),
      add: cart.find('.core_addDiscountCoupon'),
      active: cart.find('.core_removeDiscountCoupon'),
      details: {
        section: cart.find('.coupon-active'),
        deliverySection: cart.find('.coupon-delivery-active'),
        value: cart.find('.core_cartCouponValue')
      }
    },
    loyalty: {
      isGranted: cart.find('.core_grantedLoyaltyPoints'),
      usedPoints: cart.find('input[name="used_points"]'),
      use: cart.find('.core_useLoyaltyPoints')
    },
    gratis: {
      tableGratis: cart.find('.cart-table-gratis'),
      cartGratis: cart.find('.cart-table-gratis').find('.cart-gratis'),
      pattern: cart.find('.cart-table-gratis').find('.cart-gratis').find('tr').eq(0)
    },
    shipment: {
      missingValue: cart.find('.core_cartFreeShipment'),
      isFreeShipment: cart.find('.core_cartIsFreeShipment'),
      isFreeShipmentActive: cart.find('.core_cartIsFreeShipmentActive')
    },
    summary: {
      priceTotal: cart.find('.core_cartPriceTotal'),
      priceTotalGross: cart.find('.core_cartPriceTotalGross'),
      isPriceDiscount: cart.find('.core_cartIsPriceDiscount'),
      priceDiscount: cart.find('.core_cartPriceDiscount'),
      isPriceCoupon: cart.find('.core_cartIsPriceCoupon'),
      priceCoupon: cart.find('.core_cartPriceCoupon'),
      isPriceLoyalty: cart.find('.core_cartIsPriceLoyalty'),
      priceLoyalty: cart.find('.core_cartPriceLoyalty'),
      priceTotalWithDiscount: cart.find('.core_cartPriceTotalWithDiscount'),
      priceTotalWithDiscountNet: cart.find('.core_cartPriceTotalWithDiscountNet'),
      nettoOrderInfo: cart.find('.core_cartNettoOrderInfo')
    }
  };

  const isParentProduct = (parentHash, productsData) => {
    // Product is parent when it has sub products
    for (let productHash in productsData) {
      if (productsData[productHash].parentHash === parentHash) {
        return true;
      }
    }
    return false;
  };

  const indexOfSubProduct = () => {
    let parentsHash = []

    $('[data-parent-hash]').each(function (i, item) {
      parentsHash.push($(item).data('parentHash'))
    })

    let uniqueParentHash = parentsHash.filter((v, i, a) => a.indexOf(v) === i)

    for (let i = 0; i < uniqueParentHash.length; i++) {
      if ($('[data-hash= ' + uniqueParentHash[i] + ']').find('.product-set').find('.product-name').length > 0) {
        return
      } else {
        $('[data-parent-hash= ' + uniqueParentHash[i] + ']').each(function (j, subProductRow) {
          $(subProductRow).find('.product-set').remove()
          $(subProductRow).find('.product-name').attr('data-subProduct-index', j + 1 + '.');
          $(subProductRow).find('.product-name').clone().appendTo($('[data-hash= ' + uniqueParentHash[i] + ']').find('.product-set'))
        })
      }
    }

    $('[data-hash]:not("[data-parent-hash]"):not(".product-item-pattern")').each(function(i, el){
      $(el).attr('data-translate', L.PRODUCT + ' #' + ++i)
    })
  }

  var manage = {
    submit: {
      toggleState: function(state){
        if(typeof state === 'undefined'){
          state = 'enable';
        }

        switch(state){
          case 'enable':

            elements.submit.removeClass('cart-disable-request');

            setTimeout(function(){
              elements.code.add.removeClass('disabled').removeAttr('disabled');
              elements.code.active.removeClass('disabled').removeAttr('disabled');
              elements.loyalty.use.removeClass('disabled').removeAttr('disabled');
              cart.find('.core_counterValueChange').removeClass('disabled cart-disable-request').removeAttr('disabled')
              cart.find('.core_removeFromCart').removeClass('hidden')
              cart.find('.core_removeFromCartLoader').addClass('hidden')
              elements.products.table.find($('.core_parseOption')).attr('disabled', false)
            },params.blockade);

            elements.loader.removeClass('loading');

            if(elements.summary.nettoOrderInfo.hasClass('hidden')){
              elements.submit.removeClass('disabled').removeAttr('disabled');
            }
            indexOfSubProduct()
          break;
          case 'disable':

            elements.submit.addClass('disabled cart-disable-request').attr('disabled','disabled');
            cart.find('.core_counterValueChange').addClass('disabled cart-disable-request').attr('disabled', 'disabled')
            cart.find('.core_removeFromCart').addClass('hidden')
            cart.find('.core_removeFromCartLoader').removeClass('hidden')
            elements.code.add.addClass('disabled').attr('disabled','disabled');
            elements.code.active.addClass('disabled').attr('disabled','disabled');
            elements.loyalty.use.addClass('disabled').attr('disabled','disabled');
            elements.products.table.find($('.core_parseOption')).attr('disabled', true)
            elements.loader.addClass('loading');
          break;
        }
      }
    },
    errors: {
      do: function(response){
        if(typeof response.user_error !== 'undefined' && typeof response.code === 'undefined' && typeof response.notice === 'undefined'){
          popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],response.user_error,'error');
        }else if(typeof response.user_error !== 'undefined' && typeof response.code !== 'undefined'){
          switch(response.code){
            case 'no_prods':
              popups.actionAlert(L['INFORMATION'],response.user_error,'info');

              $.get('/cart',function(cart){
                $(document).find('section.cart').html($(cart).find('section.cart').html());

                pricesFormatter($('section.cart'));
              });
            break;
          }
        }
      }
    },
    gratis: {
      remove: function(gratis){
        elements.gratis.cartGratis.find('tr[data-gratis="' + gratis + '"]').remove();
      },
      render: function(gratis){
        var gratisTemplate = elements.gratis.pattern[0].outerHTML;
            gratisTemplate = gratisTemplate.replace(/{{:id:}}/g,gratis.prod_id);
            gratisTemplate = gratisTemplate.replace(/#{{:url:}}/g,gratis.prod_url);
            if (gratis.prod_name.includes('$&','&amp;', '$&amp;')){
              var stringToEncode = specialCharacterNameToReplace(gratis.prod_name)
              gratisTemplate = gratisTemplate.replace(/{{:name:}}/g, stringToEncode);
            }else {
              gratisTemplate = gratisTemplate.replace(/{{:name:}}/g, gratis.prod_name);
            }
            gratisTemplate = $(gratisTemplate);
            gratisTemplate.find('[data-disabled]').prop('disabled',false).removeAttr('data-disabled');
            gratisTemplate.removeClass('gratis-product-pattern hidden');

        return gratisTemplate;
      }
    },
    products: {
      options: {
        inline: {
          render: function(product, productsData){
            if (isParentProduct(product.hash, productsData)) {
              const toggler = document.querySelector(`tr[data-id='${product.id}']`)?.querySelector('.core_toggleSubProducts')?.innerText;
              const text = toggler
                ? toggler === L.SUB_PRODUCTS_SHOW_CART
                  ? L.SUB_PRODUCTS_SHOW_CART
                  : L.SUB_PRODUCTS_HIDE_CART
                : L.SUB_PRODUCTS_SHOW_CART;

              return '<a class="core_toggleSubProducts">' + text + '</a>';
            }

            var countSelects = 0;

            // SUBPRODUCT NO PARAMS
            if(Object.values(product.options).filter(option => option.type !== 'hidden').length === 0 && product.parentHash){
              var parameterPattern = '<span class="no_subproduct_params">{{:not_selected_param:}}</span>';
              parameterPattern = parameterPattern.replace(/{{:not_selected_param:}}/g, L['NO_PARAMETERS_SUBPRODUCT_SELECTED'] );
              return parameterPattern
            }

            return Object.keys(product.options)
              .filter(function(key){
                var parameter = {
                  type: product.options[key].type,
                  selected: Object.keys(product.options[key].values).some(function(valueKey){
                    return product.options[key].values[valueKey].selected != '';
                  })
                };

                return parameter.type != 'hidden';
              })
              .map(function(key){

                var parameter = {
                  name: product.options[key].name,
                  type: product.options[key].type,
                  value: product.options[key].type == 'info' || product.options[key].type == 'range' ?
                    Object.keys(product.options[key].values).map(function(valueKey){
                      return product.options[key].values[valueKey].name;
                    }).join(', ')
                  :
                    product.options[key].values[Object.keys(product.options[key].values).filter(function(valueKey){
                      return product.options[key].values[valueKey].selected != '';
                    })[0]]
                };
                if (parameter.name.includes('$&','&amp;', '$&amp;')) {
                  const stringToEncode = specialCharacterNameToReplace(parameter.name)
                  parameter.name = stringToEncode
                }

                const parameterName = parameter.value?.name
                const parameterTextvalue = parameter.value?.textValue
                const parameterValue = parameter.value

                if (parameterName && parameterName.includes('$&','&amp;', '$&amp;')) {
                  const stringToEncode = specialCharacterNameToReplace(parameter.value.name)
                  parameter.value.name = stringToEncode
                }
                if (parameterTextvalue && parameterTextvalue.includes('$&','&amp;', '$&amp;')) {
                  const stringToEncode = specialCharacterNameToReplace(parameter.value.textValue)
                  parameter.value.textValue = stringToEncode
                }

                if (typeof(parameterValue) === 'string' && parameterValue.includes('$&','&amp;', '$&amp;')) {
                  const stringToEncode = specialCharacterNameToReplace(parameter.value)
                  parameter.value = stringToEncode
                }

                var parameterPattern = parameter.name + ':' + String.fromCharCode(160) + '<strong>{{:parameter_value:}}</strong>';

                if(parameter.type == 'info' || parameter.type == 'range'){
                  parameterPattern = parameterPattern.replace(/{{:parameter_value:}}/g,[
                    parameter.value
                  ].join(''));
                }else if (parameter.type == 'text'){
                  if(parameter.value === undefined) {
                    parameterPattern = parameterPattern.replace(/{{:parameter_value:}}/g,[
                      '<span class="not-selected">' + L['NOT_SELECTED'] + '</span>'
                    ].join(''));
                  }else{
                    parameterPattern = parameterPattern.replace(/{{:parameter_value:}}/g,[parameter.value.textValue].join(''));
                  }}
                else{
                  if(typeof parameter.value !== 'undefined'){
                    parameterPattern = parameterPattern.replace(/{{:parameter_value:}}/g,[
                      parameter.value.name + (parameter.value.change_price_f_no_dis != '' ? ' (' + parameter.value.change_price_f_no_dis.slice(1) + ')' : '')
                    ].join(''));
                  }else{
                    parameterPattern = parameterPattern.replace(/{{:parameter_value:}}/g,[
                      '<span class="not-selected">' + L['NOT_SELECTED'] + '</span>'
                    ].join(''));
                  }
                }

                if(parameter.type != 'info' && parameter.type != 'range'){
                  if(Object.keys(product.options[key].values).length > 1){
                    countSelects++;
                  }
                }

                return parameterPattern;
              }).join(', ') + (countSelects > 0 ? [' ',
                '(<a href="#" class="core_showAllParameters">',
                  L['CHANGE'],
                '</a>)'
              ].join('') : '');
          }
        },
        render: function(product){
          let isFourColumnCart = document.querySelector('.mod-cart-2');
          var optionTemplate = {
                select: elements.products.patternOptions.find('.product-parameters-select')[0].outerHTML,
                text: elements.products.patternOptions.find('.product-parameters-text')[0].outerHTML,
                all: elements.products.patternOptions.find('.product-parameters-all')[0].outerHTML,
                additionalText: elements.products.patternOptions.find('.product-parameters-additional-text')[0].outerHTML,
              },
              optionResults = '',
              optionCount = 0,
              stocksExist = false,
              stocksGroups = [];
          if(typeof product.stocks.stocks !== 'undefined'){
            Object.keys(product.stocks.stocks).forEach(function(key){
              var stock = product.stocks.stocks[key],
                  stockList = stock[Object.keys(stock)[0]];

              if(typeof stockList !== 'undefined'){
                stocksExist = true;

                stockList.list.forEach(function(item){
                  stocksGroups.push(parseFloat(item.op_id));
                });
              }
            });
          }
          Object.keys(product.options).forEach(function(key,i){
            var template,
                option = product.options[key];
                option.key = key;
                option.valuesKeys = Object.keys(option.values);

                if (option.name.includes('$&','&amp;', '$&amp;')) {
                  const stringToEncode = specialCharacterNameToReplace(option.name)
                  option.name = stringToEncode
                }

                Object.values(option.values).forEach(value => {
                  if (value.name.includes('$&','&amp;', '$&amp;')) {
                    const stringToEncode = specialCharacterNameToReplace(value.name)
                    value.name = stringToEncode
                  }
                })
            switch(option.type){
              case 'text':
                template = optionTemplate.additionalText;
                option.valuesKeys.map(function(id){
                   if(option.values[id].textValue){
                     if (option.values[id].textValue.includes('$&','&amp;', '$&amp;')) {
                       const stringToEncode = specialCharacterNameToReplace(option.values[id].textValue)
                       option.values[id].textValue = stringToEncode
                     }
                     template = template.replace(/{{:option_name:}}/g,option.name);
                     template = template.replace(/{{:option_additional_text:}}/g,option.values[id].textValue )
                   }else{
                     return template = ''
                   }
                }).join(', ');
                break;
              case 'choose':
                optionCount++;
                template = optionTemplate.select;
                template = template.replace(/{{:option_name:}}/g,option.name);
                template = template.replace(/{{:option_key:}}/g,`${key}-${product.id}`);
                template = template.replace(/{{:option_required:}}/g,option.required == 'yes' ? true : false);
                template = template.replace(/{{:option_cart_hash:}}/g,`${key}-${product.id}`);
                template = template.replace(/{{:option_options:}}/g,option.valuesKeys.map(function(id){
                  var name = option.values[id].name,
                      selected = '';
                  if(option.values[id].change_price_f_no_dis != ''){
                    name = name + ' ' + option.values[id].change_price_f_no_dis;
                  }

                  if(option.values[id].selected){
                    if((product.amount_none == 'deny' || product.amount_none == 'hide') && stocksExist && stocksGroups.indexOf(parseFloat(option.key)) > -1){
                      selected = 'data-selected="true"';
                    }else{
                      selected = option.values[id].selected;
                    }
                  }

                  return '<option value="' + id + '" name="option_' + key + '-' + product.id + '" ' + selected + '>' + name + '</option>';
                }).join(''));
                template = template.replace(/{{:option_values:}}/g,option.valuesKeys.map(function(id){
                  return option.values[id].name;
                }).join(', '));
                template = template.replace(/{{:option_init_select2:}}/g,'select-field-select2 core_parseOption');

                if((product.parentHash || product.amount_none == 'deny' || product.amount_none == 'hide') && stocksExist && stocksGroups.indexOf(parseFloat(option.key)) > -1){
                  template = template.replace(/{{:option_allow_clear:}}/g,true);
                }else if(option.required == 'no'){
                  template = template.replace(/{{:option_allow_clear:}}/g,true);
                }else{
                  template = template.replace(/{{:option_allow_clear:}}/g,false);
                }

                if(option.valuesKeys.length > 1){
                  template = template.replace(/{{:option_select_show:}}/g,'');
                  template = template.replace(/{{:option_text_show:}}/g,'hidden');
                }else{
                  template = template.replace(/{{:option_select_show:}}/g,'hidden');
                  template = template.replace(/{{:option_text_show:}}/g,'');
                }
              break;
              case 'range':
              case 'info':
                optionCount++;
                template = optionTemplate.text;
                template = template.replace(/{{:option_name:}}/g,option.name);
                template = template.replace(/{{:option_values:}}/g,option.valuesKeys.map(function(id){
                  return option.values[id].name;
                }).join(', '));
              break;
            }

            if(typeof template !== 'undefined'){
              if(optionCount > 3 && option.type !== 'text'){
                template = template.replace(/{{:option_hidden:}}/g,'hidden');
              }else{
                template = template.replace(/{{:option_hidden:}}/g,'');
              }
              if(option.type === 'text') {
                template = template.replace(/{{:option_hidden:}}/g,'');
              }
              optionResults += template;
            }
          });

          if(!optionResults){
            optionTemplate.all = ''
          }
          optionResults += optionTemplate.all;
          optionResults = $(optionResults);
          optionResults.find('[data-disabled]').prop('disabled',false).removeAttr('data-disabled');

          return optionResults;
        }
      },
      update: function(product, products){
        var productElement = elements.products.current(product.hash);

        if(productElement.parameters.inline.length > 0){
          if(productElement.parameters.inline.parent().parent('.product-set')){
            return
          }else{
            productElement.parameters.inline.html(manage.products.options.inline.render(product, products));
          }
        }

        if(data.shop.pricesType == 'gross'){
          productElement.prices.price.data('price',product.price);
          productElement.prices.priceDiscount.data('price',product.price_with_discount);
          productElement.prices.priceTotal.data('price',product.price_with_discount_sum);
        }else{
          productElement.prices.price.data('price',product.price_net);
          productElement.prices.priceDiscount.data('price',product.price_with_discount_net);
          productElement.prices.priceTotal.data('price',product.price_with_discount_net_sum);
        }

        if (productElement.amountField && product.amount !== undefined) {
          productElement.amountField.val(product.amount);
        }
      },
      render: function(product, products){
        var productTemplate = elements.products.pattern[0].outerHTML;
            productTemplate = productTemplate.replace(/{{:id:}}/g,product.id);
            productTemplate = productTemplate.replace(/{{:index:}}/g,product.index);
            productTemplate = productTemplate.replace(/{{:hash:}}/g,product.hash);
            if (product.name.includes('$&','&amp;', '$&amp;')){
              var stringToEncode = specialCharacterNameToReplace(product.name)
              productTemplate = productTemplate.replace(/{{:name:}}/g, stringToEncode);
            }else {
              productTemplate = productTemplate.replace(/{{:name:}}/g, product.name);
            }
            productTemplate = productTemplate.replace(/{{:unit:}}/g,product.prod_unit);
            productTemplate = productTemplate.replace(/{{:parameters:}}/g,manage.products.options.inline.render(product, products));
            productTemplate = productTemplate.replace(/{{:image:}}/g,product.img);
            productTemplate = productTemplate.replace('src="/view/new/img/transparent.png"', '');
            productTemplate = productTemplate.replace(/#{{:url:}}/g,product.url);
            productTemplate = productTemplate.replace(/{{:boxamount:}}/g,product.boxamount);
            productTemplate = productTemplate.replace(/{{:boxrestrict:}}/g,product.boxrestrict);
            productTemplate = productTemplate.replace(/{{:boxrestrict_bool:}}/g,product.boxrestrict_bool);
            productTemplate = productTemplate.replace(/{{:amount:}}/g,product.amount);
            productTemplate = productTemplate.replace(/{{:datatick:}}/g,product.datatick);
            productTemplate = productTemplate.replace(/{{:datamin:}}/g,product.datamin);
            productTemplate = productTemplate.replace(/{{:datamax:}}/g,product.datamax);
            productTemplate = productTemplate.replace(/data-src/g,'src');

            if(data.shop.pricesType == 'gross'){
              productTemplate = productTemplate.replace(/{{:price:}}/g,product.price);
              productTemplate = productTemplate.replace(/{{:price_discount:}}/g,product.price_with_discount);
              productTemplate = productTemplate.replace(/{{:price_total:}}/g,product.price_with_discount_sum);
            }else{
              productTemplate = productTemplate.replace(/{{:price:}}/g,product.price_net);
              productTemplate = productTemplate.replace(/{{:price_discount:}}/g,product.price_with_discount_net);
              productTemplate = productTemplate.replace(/{{:price_total:}}/g,product.price_with_discount_net_sum);
            }

            productTemplate = $(productTemplate);
            productTemplate.find('.product-parameters-pattern').html(manage.products.options.render(product)).attr('class','product-parameters');

            var productSetinCart = Object.values(products).map((pr) => {
              return pr.parentHash === product.hash
            }).includes(true)


            if (product.parentHash) {
              productTemplate.attr('data-parent-hash', product.parentHash);
              productTemplate.children().hide();
            }

            if (productSetinCart && (product.amount_none !== 'deny' && product.amount_none !== 'hide')){
              productTemplate.attr('data-productAllowToBuy', 'true')
            }

              var productStocks = {
                groups: [],
                stocks: []
              };

            if(product.parentHash || product.amount_none == 'deny' || product.amount_none == 'hide' || productSetinCart === true){


              if(typeof product.stocks.stocks !== 'undefined'){
                /* Get stocks groups */
                Object.keys(product.stocks.stocks).forEach(function(stocks,stocksIndex){
              		Object.keys(product.stocks.stocks[stocks]).forEach(function(stockGroups,stockGroupsIndex){
              			if(stockGroupsIndex == 0){
              				Object.keys(product.stocks.stocks[stocks][stockGroups].list).forEach(function(listGroups){
              					productStocks.groups.push(parseFloat(product.stocks.stocks[stocks][stockGroups].list[listGroups].op_id));
              				});
                    }
              		});
                });

                /* Get stocks stocks */
                Object.keys(product.stocks.stocks).forEach(function(stocks,stocksIndex){
                  Object.keys(product.stocks.stocks[stocks]).forEach(function(stock,stockIndex){
                    var item = {
                      'items': [],
                      'amount': parseFloat(product.stocks.stocks[stocks][stock].sp_amount)
                    };

                    Object.keys(product.stocks.stocks[stocks][stock].list).forEach(function(list,listIndex){
                      item.items.push({
                        'option_id': parseFloat(product.stocks.stocks[stocks][stock].list[list].ov_id),
                        'option_name': escapeAttributeValue(product.stocks.stocks[stocks][stock].list[list].ov_name),
                        'group_id': parseFloat(product.stocks.stocks[stocks][stock].list[list].op_id),
                        'group_name': escapeAttributeValue(product.stocks.stocks[stocks][stock].list[list].op_name)
                      });
                    });

                    productStocks.stocks.push(item);
                  });
                });
              }

              var productStocksTemplate = {
                'groups': productStocks.groups,
                'stocks': productStocks.stocks
              };

              if (product.parentHash) {
                const parent = {
                  id: document.querySelector(`[data-hash=${product.parentHash}]`).getAttribute('data-id'),
                  stocksTable: document.querySelector(`[data-hash=${product.parentHash}]`).querySelector('[data-stocks]'),
                  get stocks() { return JSON.parse(this.stocksTable.getAttribute('data-stocks')) },
                  set addStocks(stock) { this.stocksTable.setAttribute('data-stocks', JSON.stringify(stock)) }
                }
                let stocks = parent.stocks;

                parent.addStocks = stocks.stocks ? { [product.id]: productStocksTemplate } : { ...stocks, [product.id]: productStocksTemplate };
              }


              productTemplate.find('[data-stocks-pattern]').attr('data-stocks',JSON.stringify(productStocksTemplate)).removeAttr('data-stocks-pattern');
            }else{
              productTemplate.find('[data-stocks-pattern]').removeAttr('data-stocks-pattern');
            }

            initializeSelect2(productTemplate.find('.select-field-select2'));

            productTemplate.find('[data-disabled]').prop('disabled',false).removeAttr('data-disabled');
            productTemplate.removeClass('product-item-pattern hidden');

        if (document.querySelector('.mod-cart-1') && product.parentHash) {

          const parentProductParameters = document
            .querySelector(`[data-hash=${product.parentHash}]`)
            .querySelector('table.product-parameters');
          let tbody = parentProductParameters.querySelector('tbody');

          if(Object.values(product.options).filter(option => option.type !== 'hidden').length > 0) {
            let productParameters = productTemplate[0]
                .querySelector('.product-parameters')
                .getElementsByTagName('tbody')[0]
                .cloneNode(true);

            const productName = document.createElement('tr');

            initializeSelect2($(productParameters).find('.select-field-select2'));

            productParameters.querySelectorAll('tr.product-parameters-select').forEach(item => {
              item.querySelectorAll('.select-field-select2-container')[1].remove()
            })

            productName.classList.add('product-parameters-name');
            productName.innerHTML = `
              <th colspan='2'>
                <span class="parameters-popup-subproduct-name">
                  ${product.name}
                </span>
              </th>
            `;

            if (parentProductParameters.hasAttribute(`data-hash-${product.id}`)) return

            parentProductParameters.dataset[`hash-${product.id}`] = true;
            productParameters.insertBefore(productName, productParameters.firstChild);

            if (!tbody) {
              parentProductParameters.appendChild(productParameters);
            } else {
              let productParametersCount = productParameters.childNodes.length;
              let parentParametersCount = Array.from(tbody.children).filter((el) => !el.classList.contains('no-selected-parameters')).length;

              for (let i = productParametersCount; i > 0; i--) {
                let childNode = productParameters.childNodes[0];

                if (parentParametersCount > 4 && !(childNode.outerHTML.includes('product-parameters-all'))) {
                  childNode.classList.add('hidden');
                }

                if (!(childNode.outerHTML.includes('product-parameters-name')) && !(childNode.outerHTML.includes('product-parameters-all'))) {
                  parentParametersCount++;
                }

                tbody.appendChild(childNode);
              }

              let selectAllCount = tbody.querySelectorAll('.product-parameters-all').length;

              for (selectAllCount; selectAllCount > 1; selectAllCount--) {
                tbody.removeChild(tbody.querySelector('.product-parameters-all'));
              }
            }
          }else{
            const productName = document.createElement('tr');
            productName.classList.add('product-parameters-name');
            productName.classList.add('no-selected-parameters');
            productName.innerHTML = `
                <tr>
                  <th colspan="2">
                    <span class="parameters-popup-subproduct-name">
                      ${product.name}
                    </span>
                    <p style="font-weight: 400">${L['NO_PARAMETERS_SUBPRODUCT_SELECTED']}</p>
                  </th>
                </tr>
            `;

            if(!tbody){
              parentProductParameters.append(document.createElement('tbody'))
              tbody = parentProductParameters.querySelector('tbody');
              $(tbody).append(productName)
            }else {
              $(tbody).find('.product-parameters-all').length ? $(productName).insertBefore($(tbody).find('.product-parameters-all')) : $(tbody).append(productName)
              !$(tbody).find('.product-parameters-all').length ? $(tbody).find('.no-selected-parameters').removeClass('hidden') : null
            }
          }
          $(tbody).find('.product-parameters-all').length ? $(tbody).find('.no-selected-parameters').addClass('hidden') : null
        }

        return productTemplate;
      }
    }
  };

  var url = '/cart/?json=1&rebuild=1';
    clearTimeout(cartUpdateAjax);

  if(cartUpdateXhr && cartUpdateXhr.readyState !== 4){
    cartUpdateXhr.abort();
  }
  cartUpdateAjax = setTimeout(function(){
    cartUpdateXhr = $.ajax({
      type: 'POST',
      url: url,
      data: {
        time: Date.now(),
        products: $.base64Encode(JSON.stringify(SkyShop.cart.products)),
        hash: params.hash,
        code: cookies.read('ac_code'),
        loyalty: cookies.read('ac_loyalty')
      },
      dataType: 'json',
      beforeSend: function(){
        manage.submit.toggleState('disable');
      },
      success: function(response){
        if(typeof response.user_error === 'undefined' && typeof response.notice === 'undefined'){
          if(elements.products.tableBody.data('rendered') === true){
            elements.products.tableBody.find('tr[data-hash]:not(".product-item-pattern")').remove()
            buildCartProductsOrder(elements.products.tableBody.data('rendered'), response)
          }

          SkyShop.cart.ajaxHash = [];
          Object.keys(response).forEach(function(action){
            var rsp = response[action];

            switch(action){
              case 'products':
                var discounts = 0;

                const subProductsHashes = Object.keys(rsp).filter(hash => rsp[hash].parentHash);
                const productHashes = Object.keys(rsp).filter(hash => !subProductsHashes.includes(hash));

                // Sort hashes alphabetically by products names
                productHashes.sort((a, b) => {
                  const nameA = rsp[a].name.toUpperCase();
                  const nameB = rsp[b].name.toUpperCase();
                  if (nameA < nameB) {
                    return -1;
                  }
                  if (nameA > nameB) {
                    return 1;
                  }
                  return 0;
                });

                // Insert sub products in correct places (after sets)
                subProductsHashes.forEach(subProductHash => {
                  const parentHash = rsp[subProductHash].parentHash;
                  if (!parentHash) {
                    return;
                  }
                  const parentIndex = productHashes.indexOf(parentHash);
                  productHashes.splice(parentIndex + 1, 0, subProductHash);
                });

                let index = 0;
                for (let hash of productHashes) {
                  var product = rsp[hash];
                  product.hash = hash;
                  product.index = ++index;
                  product.datamax = ((product.prod_amount <= 0 && product.amount_none != 'deny') || (product.prod_amount > 0 && (product.amount_none == 'allow' || product.amount_none.indexOf('longer_') > -1))) ? 524288 : product.prod_amount;

                  if(data.shop.pricesType == 'gross'){
                    if(product.price > product.price_with_discount){
                      discounts++;
                    }
                  }else{
                    if(product.price_net > product.price_with_discount_net){
                      discounts++;
                    }
                  }
                    elements.products.tableBody.append(manage.products.render(product, rsp));
                };

                if(discounts > 0){
                  elements.products.table.find('.product-discount').removeClass('hidden');
                }else{
                  elements.products.table.find('.product-discount').addClass('hidden');
                }

                if(params.rendered != null){
                  params.rendered();
                }


                  $(document).find('.core_cardStocksManage').trigger('stockManage',[{
                    build: function(stock){
                      stock.find('.product-parameters-select').each(function () {
                        const select = $(this).find('.select-field-select2')
                        const value = select.find('[data-selected]').val() || select.find('[selected]').val()

                        if (value) {
                          select.val(value).trigger('click')
                        }
                      })
                    }
                  }])

              break;
              case 'details':
                if(rsp.min_ord_price.net > 0 && rsp.sum_net < rsp.min_ord_price.net){
                  elements.summary.nettoOrderInfo.removeClass('hidden');
                }else{
                  elements.summary.nettoOrderInfo.addClass('hidden');
                }

                if(data.shop.pricesType == 'gross'){
                  elements.summary.priceTotal.data('price',rsp.sum_prev);
                }else{
                  elements.summary.priceTotal.data('price',rsp.sum_prev_net);
                  elements.summary.priceTotalGross.data('price',rsp.sum_prev);
                }

                elements.summary.priceTotalWithDiscount.data('price',rsp.sum);
                elements.summary.priceTotalWithDiscountNet.data('price',rsp.sum_net);
              break;
              case 'discounts':
                if(!rsp.hasOwnProperty("loyalty")){
                  elements.summary.priceLoyalty.data('price',0);
                  elements.summary.isPriceLoyalty.addClass('hidden');
                }
                Object.keys(rsp).forEach(function(type){
                  var discount = rsp[type];

                  switch(type){
                    case 'group':
                      if(discount.sum > 0){
                        elements.summary.priceDiscount.data('price',discount.sum);
                        elements.summary.isPriceDiscount.removeClass('hidden');
                      }else{
                        elements.summary.priceDiscount.data('price',0);
                        elements.summary.isPriceDiscount.addClass('hidden');
                      }
                    break;
                    case 'code':
                      elements.code.details.value.data('price',discount.sum);
                      elements.summary.priceCoupon.data('price',discount.sum);
                    break;
                    case 'loyalty':
                      if(discount.used_points_to_price > 0){
                        elements.summary.priceLoyalty.data('price',discount.used_points_to_price);
                        elements.summary.isPriceLoyalty.removeClass('hidden');
                      }
                      if(elements.loyalty.isGranted.data('granted') === false && discount.used_points_to_price > 0){
                        elements.loyalty.isGranted.html(L['NOT_AWARD_NEW_POINTS']);
                      }else{
                        elements.loyalty.isGranted.html(L['AFTER_YOU_PAY_THE_ORDER_WILL_RECEIVE'].replace('[POINTS]',discount.get_point_in_order));
                      }

                      elements.loyalty.usedPoints.val(discount.used_points);
                      elements.loyalty.usedPoints.attr('data-max',discount.max_used_points);
                      cookies.create('ac_loyalty',discount.used_points,0);
                    break;
                  }
                });
              break;
              case 'code':
                if(rsp.user_error == ''){
                  elements.code.value.addClass('input-disabled').attr('readonly','readonly').val(cookies.read('ac_code'));
                  elements.code.add.addClass('hidden');
                  elements.code.active.removeClass('hidden');
                  elements.code.details.section.removeClass('hidden');
                  elements.summary.isPriceCoupon.removeClass('hidden');
                  elements.code.details.deliverySection.addClass('hidden')

                  if(rsp.code_type === 'free_delivery'){
                    elements.summary.isPriceCoupon.addClass('hidden')
                    elements.code.details.section.addClass('hidden')
                    elements.code.details.deliverySection.removeClass('hidden')
                    elements.shipment.isFreeShipment.addClass('hidden')
                    SkyShop.order.freeDeliveryCoupon = true
                    cookies.create('ac_freeDeliveryCoupon', true)
                  }

                  if(typeof callback !== 'undefined'){
                    callback();
                  }
                }else if(rsp.length == 0){
                  elements.code.value.removeClass('input-disabled').removeAttr('readonly').val('');
                  elements.code.add.removeClass('hidden');
                  elements.code.active.addClass('hidden');
                  elements.shipment.isFreeShipment.removeClass('hidden')
                  elements.code.details.section.addClass('hidden');
                  elements.summary.isPriceCoupon.addClass('hidden');
                  elements.code.details.deliverySection.addClass('hidden')
                }else{
                  popups.actionAlert(L.ERROR_UNEXPECTED_ERROR, rsp.user_error, 'error');
                  cookies.erase('ac_code');
                  SkyShop.order.freeDeliveryCoupon = false
                  cookies.erase('ac_freeDeliveryCoupon')
                  elements.code.details.deliverySection.addClass('hidden')
                  elements.code.add.removeClass('hidden');
                  elements.code.active.addClass('hidden');
                  elements.code.value.removeClass('input-disabled').removeAttr('readonly').val('');
                  manage.submit.toggleState('enable')
                }
              break;
              case 'shipments':
                if(typeof rsp.free === 'undefined' || response.code?.code_type === 'free_delivery' && response.code?.user_error.length === 0){
                  elements.shipment.isFreeShipment.addClass('hidden');
                  elements.shipment.isFreeShipmentActive.addClass('hidden');
                }else{
                  if(rsp.free.price > 0){
                    elements.shipment.missingValue.data('price',rsp.free.price);
                    elements.shipment.isFreeShipment.removeClass('hidden');
                    elements.shipment.isFreeShipmentActive.addClass('hidden');
                  }else{
                    elements.shipment.isFreeShipment.addClass('hidden');
                    elements.shipment.isFreeShipmentActive.removeClass('hidden');
                  }
                }
              break;
              case 'gratis':
                if(rsp != null && Object.keys(rsp).length > 0){
                  var gratisData = {
                    exists: [],
                    used: []
                  };

                  elements.gratis.cartGratis.find('tr').slice(1).each(function(){
                    gratisData.exists.push(
                      parseFloat($(this).data('gratis'))
                    );
                  });

                  Object.keys(rsp).forEach(function(id){
                    var gratis = rsp[id];
                        gratisData.used.push(
                          parseFloat(gratis.prod_id)
                        );

                    if(gratisData.exists.indexOf(parseFloat(gratis.prod_id)) == -1){
                      elements.gratis.cartGratis.append(manage.gratis.render(gratis));
                    }
                  });

                  gratisData.exists.filter(function(gratis){
                    return gratisData.used.indexOf(gratis) == -1;
                  }).forEach(function(id){
                    manage.gratis.remove(id);
                  });

                  if(elements.gratis.tableGratis.css('display') == 'none'){
                    elements.gratis.tableGratis.transition('slideDown',100);
                  }
                }else{
                  if(elements.gratis.tableGratis.css('display') != 'none'){
                    elements.gratis.tableGratis.transition('slideUp',100,function(){
                      elements.gratis.cartGratis.find('tr').slice(1).remove();
                    });
                  }
                }
              break;
            }
          });
          pricesFormatter(cart);
          manage.submit.toggleState('enable');
          elements.products.tableBody.attr('data-rendered', true)

          //GTAG EVENT 'view_cart'
          gtagEvent('view_cart', {value: response.details.sum, item: response.products});

        }else{
          if(typeof response.notice !== 'undefined'){
            data.security.countAjax++;

            if(data.security.countAjax >= data.security.maxAjax){
              manage.submit.toggleState('enable');
              manage.errors.do(response);
            }else{
              $.ajax(this);
            }
          }else if(typeof response.user_error !== 'undefined'){
            manage.submit.toggleState('enable');
            manage.errors.do(response);
          }
        }
      },
      error: function(response){
        data.security.countAjax++;

        if(data.security.countAjax >= data.security.maxAjax){
          manage.submit.toggleState('enable');
          manage.errors.do(response);
        }else{
          $.ajax(this);
        }
      }
    });
  },params.wait);
};

var orderRenderStarInput = function(validStar){
  if(validStar) {
     $('.core_personalOrderShipment').find($('.order-title-section')).children().css({display: 'inline-block'})
  }
    else{
    $('.core_personalOrderShipment').find($('.order-title-section')).children().css({display: 'none'})
  }
}


//LIMITED SHIPMENT OPTIONS
var renderLimitedOrderOptions = function (selectOptions, isRequired) {

  var limitedGhostInputs = {
    limitedCity: '.userCity',
    limitedPostalCode :'.userPostalCode',
    limitedStreets: '.userStreets',
  }

  var renderOptions = function (adressArray) {

    var template = ''
    adressArray.forEach(function (adressOption) {
      template += '<option> ' + adressOption + ' </option> '
    });
    return template
  }

  var renderOrderFormInputs = function (select, array, selectName){

    if(array.length === 1 && selectName !== 'user_street') {
      var selectErrorContainerHeight
      select.children().eq(1).replaceWith('<select name='+selectName+' data-valid="required" data-storage="attr(name)|ac_"></select>')
      select.children().eq(1).html(renderOptions(array))
      select.children().eq(1).select2({
        theme: 'bootstrap',
        width: '100%',
        minimumResultsForSearch: -1,
      }).on('select2:open',function(){
        $('.select2-results > ul').scrollbar();
      }).on('select2:closing',function(){
        $('.select2-results > ul').scrollbar('destroy');
          });
      selectErrorContainerHeight = $('.order').find($('.select2-container')).innerHeight() + 'px'
      select.find($('select[name='+ selectName+ ']')).attr('style', 'left: 0; width: calc(100% - 30px) !important; height: calc('+selectErrorContainerHeight +' + 2px) !important; min-height: 36px')
    }

    if(array.length > 1 && selectName !== 'user_street'){
      var selectErrorContainerHeight
      select.children().eq(1).replaceWith('<select name='+selectName+' data-valid="required" data-storage="attr(name)|ac_">' +
          '<option></option>'
          + renderOptions(array) +
          '</select>')
      select.children().eq(1).select2({
        theme: 'bootstrap',
        width: '100%',
        placeholder: 'Wybierz z listy',
        minimumResultsForSearch:  array.length > 1 ? 1 : -1,
        allowClear: true
      }).on('select2:open',function(){
        $('.select2-results > ul').scrollbar();
      }).on('select2:closing',function(){
            $('.select2-results > ul').scrollbar('destroy');
          });

      selectErrorContainerHeight = $('.order').find($('.select2-container')).innerHeight() + 'px'
      select.find($('select[name='+ selectName+ ']')).attr('style', 'left: 0; width: calc(100% - 30px) !important; height: calc('+selectErrorContainerHeight +' + 2px) !important; min-height: 36px ')
    }

    if(selectName === 'user_street'){
      var selectErrorContainerHeight
      select.children().eq(0).css({display: 'none'})
      select.children().eq(1).replaceWith(
          '<div style="width: 60%; display: inline-block">' +
          '<span class="order-title-section"> Ulica <span class="required">*</span> </span>' +
          '<select name="limited_street" data-valid="required" data-storage="attr(name)|ac_">' +
          '<option></option>'
          + renderOptions(array) +
          '</select>' +
          '</div>')
      if(array.length === 1) {
        select.find('select[name="limited_street"]').html(renderOptions(array))
      }
      select.find('select[name="limited_street"]').select2({
        theme: 'bootstrap',
        width: '100%',
        placeholder: 'Wybierz z listy',
        minimumResultsForSearch: array.length > 1 ? 1 : -1,
        allowClear: true
      }).on('select2:open',function(){
        $('.select2-results > ul').scrollbar();
      }).on('select2:closing',function(){
        $('.select2-results > ul').scrollbar('destroy');
      });
      select.append(
          '<div style="width: 30%; float: right">' +
          '<span class="order-title-section">nr domu <span class="required"> *</span> </span>' +
          '<input class="input-field" name="limited_house" data-valid="required|minlength:1">' +
          '<input style="display: none" class="input-field" name='+selectName+' data-storage="attr(name)|ac_" >' +
          '</div>')
      select.find('input[name="limited_house"]').on('change', function (){
        select.find('input[name="user_street"]').val(select.find('select[name="limited_street"]').val() + ' ' + select.find('input[name="limited_house"]').val())
      })
      selectErrorContainerHeight = $('.order').find($('.select2-container')).innerHeight() + 'px'
      select.find($('select[name="limited_street"]')).attr('style', 'left: 0; width: 55% !important; height: calc('+selectErrorContainerHeight +' + 3px) !important; min-height: 36px ')
    }
  }
  
  var defaultRender = function (defaultSelect, inputName, cookiesVal, validRule, postCode) {
    var spanTitle = defaultSelect.children().eq(0).html()
    var clientProfileCredentials = defaultSelect.children().eq(1).val()

    if(isRequired){
      if(postCode) {
        defaultSelect.html(
            '<span class="order-title-section">' + spanTitle + '</span>' +
            '<input data-valid-parent-postcode='+postCode+'  class="input-field" type="text" data-valid-parent-required="shipmentRequired" type="text" data-valid-parent-required="shipmentRequired" name='+inputName+' data-valid='+validRule+'  data-storage="attr(name)|ac_">')
      }else{
        defaultSelect.html(
            '<span class="order-title-section">' + spanTitle + '</span>' +
            '<input class="input-field" type="text"  data-valid-parent-required="shipmentRequired" type="text" data-valid-parent-required="shipmentRequired" name='+inputName+' data-valid='+validRule+'   data-storage="attr(name)|ac_" >')
      }
    }else{
      defaultSelect.html(
          '<span class="order-title-section">' + spanTitle + '</span>' +
          '<input class="input-field" type="text"  data-valid-parent-required="shipmentRequired" type="text" data-valid-parent-required="shipmentRequired" name='+inputName+'   data-storage="attr(name)|ac_" >')
    }
    if(cookies.read(cookiesVal)){
      defaultSelect.find($('input[name='+inputName+']')).val(cookies.read(cookiesVal))
    }else{
      defaultSelect.find($('input[name='+inputName+']')).val(clientProfileCredentials)
    }
  }

  if (selectOptions.cities && selectOptions.cities.length > 0) {
    var self = $(limitedGhostInputs.limitedCity)
      defaultRender(self, 'user_city', 'ac_user_city', 'required|minlength:3')
      renderOrderFormInputs(self, selectOptions.cities, 'user_city')
  } else {
    var self = $(limitedGhostInputs.limitedCity)
      defaultRender(self, 'user_city', 'ac_user_city', 'required|minlength:3')
  }
  if (selectOptions.postal_codes && selectOptions.postal_codes.length > 0) {
    var self = $(limitedGhostInputs.limitedPostalCode)
      defaultRender(self, 'user_code', 'ac_user_code', 'required|postcode', '.user_country')
      renderOrderFormInputs(self, selectOptions.postal_codes, 'user_code')
  } else {
    var self = $(limitedGhostInputs.limitedPostalCode)
      defaultRender(self, 'user_code', 'ac_user_code','required|postcode', '.user_country')
  }
  if (selectOptions.streets && selectOptions.streets.length > 0) {
    var self = $(limitedGhostInputs.limitedStreets)
    defaultRender(self, 'user_street', 'ac_user_street', 'required|streetAddressNr')
    renderOrderFormInputs(self, selectOptions.streets, 'user_street')
  } else {
    var self = $(limitedGhostInputs.limitedStreets)
    defaultRender(self, 'user_street', 'ac_user_street', 'required|streetAddressNr')
  }
}

// ORDER SUMMARY RENDER - products and prices preview

const orderRenderProductsList = function (elements, products) {
  elements.productTable
      .children(':not(.product-list-item-template)')
      .remove();

  // after remove any other rows, inside exist only template row
  const template = elements.productTable.html();
  const staticTemplateVariables = {
    price: 'price',
    id: 'id',
    amount: 'amount',
    hash: 'hash',
    tax: 'tax',
    image_url: 'image',
    image_tag: 'imgTag',
    name: 'name',
    options_string: 'optionsString',
    options_details: 'optionsDetails',
    formatted_price: 'formattedPrice',
  };
  const priceType = elements.body.data('hurt-price-type');
  let items = [];

  SkyShop.cart.products = {};
  products.forEach(function (product) {
    let item = template;
    product.image += '_125.jpg';
    if (product.name.includes('$&','&amp;', '$&amp;')) {
      const stringToEncode = specialCharacterNameToReplace(product.name)
      product.name = stringToEncode
    }
    product.imgTag = `<img src="${product.image}" alt="${product.name}"/>`;
    product.optionsString = product.options
        .map(option => `${option.valueId}:${option.valueId}`)
        .join(',');

    product.optionsDetails = product.options
        .map(option => {
          if (option.name.includes('$&','&amp;', '$&amp;')) {
            const stringToEncode = specialCharacterNameToReplace(option.name)
            option.name = stringToEncode
          }

          if (option.value.includes('$&','&amp;', '$&amp;')) {
            const stringToEncode = specialCharacterNameToReplace(option.value)
            option.value = stringToEncode
          }

          if (option.isText) {
            return `<br>${option.name}: <span style="word-break: break-word">${option.value}</span>`;
          }
          return `${option.name}: <span>${option.value}</span>`;
        })
        .join(' ');

    product.formattedPrice = `<span class="core_priceFormat" data-price="${product.price}" data-tax="${product.tax}" data-price-type="${priceType}|show_type"></span>`;
    if (['netto', 'netto_brutto'].includes(priceType)) {
      product.formattedPrice += `<br /><span class="core_priceFormat" data-price="${product.price}" data-tax="${product.tax}" data-price-type="brutto|show_type"></span>`;
    }

    for (let key in staticTemplateVariables) {
      if( key === 'name'){
        if (product[staticTemplateVariables[key]].includes('$&','&amp;', '$&amp;')){
          var stringToEncode = specialCharacterNameToReplace(product[staticTemplateVariables[key]])
          item = item.replace(new RegExp(`{{:${key}:}}`, 'g'), stringToEncode);
        }else {
          item = item.replace(new RegExp(`{{:${key}:}}`, 'g'), product[staticTemplateVariables[key]]);
        }
      }
      item = item.replace(new RegExp(`{{:${key}:}}`, 'g'), product[staticTemplateVariables[key]]);
    }

    item = $(item).removeClass('product-list-item-template hidden');

    if (product.hash) { // gratis has no hash
      SkyShop.cart.products[product.hash] = {
        id: product.id,
        name: product.name,
        price: product.price,
        amount: product.amount,
        options: Object.fromEntries(product.options.map(option => [option.valueId, option.valueId]))
      }
    }

    items.push(item);
  });

  elements.productTable.append(items);
};

var orderRenderLoyaltyPoints = function (elements, pointsForOrder) {
  if (!elements.loyaltyPointsForOrder) {
    return;
  }
  elements.loyaltyPointsForOrder[pointsForOrder ? 'removeClass' : 'addClass']('hidden');
  elements.loyaltyPointsForOrderCounter.text(pointsForOrder);
};

var orderRenderCalculations = function (calculations) {
  if (SkyShop.order.calculations && SkyShop.order.calculations.gratisId && !calculations.gratisId) {
    swal({
      confirmButtonClass: 'btn',
      title: L.INFORMATION,
      html: L.GRATIS_REMOVED
    });
  }
  SkyShop.order.freeDeliveryCoupon = cookies.read('ac_freeDeliveryCoupon')
  SkyShop.order.calculations = calculations;

  var orderPreview = $('.order .order-preview');
  var orderInner = {
    body: $('body'),
    priceItems: orderPreview.find('.core_orderPriceItems'),
    priceShipment: orderPreview.find('.core_orderPriceShipment'),
    priceOverhead: orderPreview.find('.core_orderPriceOverhead'),
    priceIsOverhead: orderPreview.find('.core_orderIsPriceOverhead'),
    priceTotal: orderPreview.find('.core_orderPriceTotal'),
    wdtInfo: orderPreview.find('#core_wdtInfo'),
    productTable: orderPreview.find('.core_storeCartProducts tbody'),
    loyaltyPointsForOrder: orderPreview.find('.points-for-order'),
    loyaltyPointsForOrderCounter: orderPreview.find('.points-for-order .points-count')
  };

  orderRenderProductsList(orderInner, calculations.products);
  orderRenderLoyaltyPoints(orderInner, calculations.pointsForOrder);

  orderInner.priceTotal.data('price', calculations.orderPriceTotal);
  orderInner.priceShipment.data('price', calculations.orderPriceShipment || 0);
  orderInner.priceItems.data('price', calculations.orderProductsPricesSum)

  if (calculations.orderPaymentOverhead !== null) {
    orderInner.priceOverhead.data('price', calculations.orderPaymentOverhead);
    orderInner.priceIsOverhead.removeClass('hidden');
  } else {
    orderInner.priceOverhead.data('price', 0);
    orderInner.priceIsOverhead.addClass('hidden');
  }

  if(calculations.isWdt == true) {
    orderInner.wdtInfo.removeClass('hidden')
  } else {
    orderInner.wdtInfo.addClass('hidden')
  }

  pricesFormatter(orderPreview);

  //GATAG EVENT 'begin_checkout'
  gtagEvent('begin_checkout', {value: calculations.orderPriceTotal, item: calculations.products});
};

var orderCalculate = function(){
  // Some request exists and it's not completed - abort
  if (SkyShop.core.orderCalculationAjax && SkyShop.core.orderCalculationAjax.readyState !== 4) {
    SkyShop.core.orderCalculationAjax.abort();
  }
  SkyShop.order.wdt = $('.order input#param-rules-wdt').prop("checked")

  var request = $.ajax({
    type: 'GET',
    url: '/order/',
    data: {
      json: 1,
      recalculate: 1,
      c: SkyShop.order.userCountry,
      pay_id: SkyShop.order.paymentId,
      shipment: SkyShop.order.shipmentSelected,
      wdt: SkyShop.order.wdt ? 1 : 0,
      gratis: SkyShop.order.calculations && SkyShop.order.calculations.gratisId || ''
    },
    dataType: 'json'
  });

  request.done(orderRenderCalculations);
  SkyShop.core.orderCalculationAjax = request;
};

var orderRenderDeliveries = function(methods){
  var order = $('.order');

  var data = {
    methods: function(methods){
      var sortedMethods = {},
          selectedMethod = cookies.read('ac_shipment') != null && Object.keys(methods).indexOf(cookies.read('ac_shipment')) > -1 ? cookies.read('ac_shipment') : null;

      Object.keys(methods).forEach(function(key){
        var method = methods[key];

        if(typeof sortedMethods[method.order] !== 'undefined'){
          method.order = Math.floor(Math.random() * (1000-100+1) + 100).toString();
        }

        sortedMethods[method.order] = method;
        sortedMethods[method.order].uniqueId = key;
      });

      return {
        sorted: sortedMethods,
        selected: selectedMethod
      };
    }
  };

  var elements = {
    deliveries: order.find('#order-deliverys-methods'),
    empty: order.find('#order-deliverys-methods-empty'),
    error: order.find('#order-deliverys-methods-error'),
    methods: {
      container: order.find('#order-deliverys-methods').children('tbody'),
      all: order.find('#order-deliverys-methods').children('tbody').children('tr').not('[class*="pattern"]'),
      pattern: order.find('#order-deliverys-methods').children('tbody').children('.delivery-method-pattern'),
      patternMore: order.find('#order-deliverys-methods').children('tbody').children('.delivery-method-more-pattern')
    }
  };

  var manage = {
    methods: {
      render: function(method,selected,i){
        var isSelected = (selected != null && selected == method.uniqueId) || (selected == null && i == 0);
        var deliveryTemplate = elements.methods.pattern[0].outerHTML;
            deliveryTemplate = deliveryTemplate.replace(/{{:id:}}/g,method.uniqueId);
            if (method.name.includes('$&','&amp;', '$&amp;')){
              var stringToEncode = specialCharacterNameToReplace(method.name)
              deliveryTemplate = deliveryTemplate.replace(/{{:name:}}/g, stringToEncode);
            }else {
              deliveryTemplate = deliveryTemplate.replace(/{{:name:}}/g, method.name);
            }
            deliveryTemplate = deliveryTemplate.replace(/{{:description:}}/g,method.desc);
            deliveryTemplate = deliveryTemplate.replace(
                /{{:cost:}}/g,
                SkyShop.order.wdt && !SkyShop.order.freeDeliveryCoupon ? method.price_net : method.price
            );

            if(method.personal == 'yes'){
              deliveryTemplate = deliveryTemplate.replace(/{{:shipment_type:}}/g,'personal');
            }else{
              deliveryTemplate = deliveryTemplate.replace(/{{:shipment_type:}}/g,'delivery');
            }
            if(method.require_address == 'yes'){
              deliveryTemplate = deliveryTemplate.replace(/{{:require_address:}}/g,'shipmentRequired');
            }else{
              deliveryTemplate = deliveryTemplate.replace(/{{:require_address:}}/g,'');
            }
            deliveryTemplate = deliveryTemplate.replace(/{{:ic-path:}}/g, `<img class="payment-ico" src="${method.iconPath}" alt="">`);

            deliveryTemplate = $(deliveryTemplate)
            deliveryTemplate.removeClass('delivery-method-pattern').css('display','none').removeClass('hidden');

            deliveryTemplate.not('.delivery-method-pattern').attr('cy-data', 'orderDelivery')

            if(isSelected){
              SkyShop.order.shipmentSelected = method.uniqueId;

              deliveryTemplate.addClass('active');
              deliveryTemplate.attr('data-auto-selected',true);
              deliveryTemplate.find('input[name="shipment"]').prop('checked',true);
            }

            if(method['function'] != 'none'){
              deliveryTemplate.addClass('core_getOrderShipmentsSpecial');
              deliveryTemplate.attr('data-key',method.uniqueId);
              deliveryTemplate = $().add(deliveryTemplate).add(
                $(elements.methods.patternMore[0].outerHTML)
                  .removeClass('delivery-method-more-pattern')
                  .css('display',isSelected ? 'table-row' : 'none')
                  .css('opacity',isSelected ? 1 : 0)
                  .addClass(isSelected ? 'open' : '')
                  .removeClass('hidden')
              ).add('<tr class="tr-separator"></tr>')
            }else{
              deliveryTemplate = $().add(deliveryTemplate).add('<tr class="tr-separator"></tr>')
            }


        return deliveryTemplate;
      }
    },
    error: {
      render: function(){
        elements.error.text(methods.user_error);
        elements.error.data('deliveryError', 1)

      }
    }
  };

  if(typeof methods.user_error === 'undefined'){
    removeError(elements.empty);
    removeError(elements.error);
    elements.error.data('deliveryError', 0)
    $().add(elements.error).add(elements.empty).transition('fadeOut',200);

    methods = data.methods(methods);
    setTimeout(function(){
      elements.methods.all = order.find('#order-deliverys-methods').children('tbody').children('tr').not('[class*="pattern"]');
      elements.methods.all.remove();

      Object.keys(methods.sorted).forEach(function(key,i){
        elements.methods.container.append(
          manage.methods.render(methods.sorted[key],methods.selected,i)
        );
      });

      elements.methods.all = order.find('#order-deliverys-methods').children('tbody').children('tr').not('[class*="pattern"]');
      elements.methods.all.each(function(){
        if($(this).data('auto-selected') === true){
          $(this).trigger('click',{
            updateCookie: false
          });
        }
      });

      pricesFormatter(elements.methods.all);

      $().add(elements.deliveries).add(elements.methods.all.not('.more')).transition('fadeIn',200);
    },180);
  }else{
    removeError(elements.empty);

    $().add(elements.deliveries).add(elements.empty).transition('fadeOut',200);

    setTimeout(function(){
      manage.error.render();
      elements.error.transition('fadeIn',200);
    },180);
  }
};

var popups = {
  addToCart: function(callback){
    swal({
      width: 650,
      customClass: 'swal-shop-action-popup',
      confirmButtonText: L['CONTINUE_SHOPPING'],
      confirmButtonClass: 'btn',
      showCancelButton: true,
      cancelButtonText: L['MAKE_ORDER'],
      cancelButtonClass: 'btn',
      title: L['PRODUCT_ADDED'],
      type: 'success',
      html: L['PRODUCT_ADDED_E_AMOUNT']
    }).then(function(){
			if(callback){
        callback();
      }
		},function(){
      window.location = '/cart/';
    });

    $('.swal-shop-action-popup').find('.btn').blur();
  },
  actionAlert: function(title,content,type,callback, popupCallback){
    swal({
      width: 550,
      customClass: 'swal-shop-action-popup',
      confirmButtonText: 'OK',
      confirmButtonClass: 'btn',
      title: title,
      type: type,
      html: content,
      onClose: popupCallback ? popupCallback : null
    }).then(function(){
			if(callback){
        callback();
      }
		});
  },
  yesNo: function(title,content,type,callbackYes,callbackNo){
    swal({
      width: 550,
      customClass: 'swal-shop-action-popup',
      confirmButtonText: L['YES'],
      confirmButtonClass: 'btn',
      showCancelButton: true,
      cancelButtonText: L['NO'],
      cancelButtonClass: 'btn',
      title: title,
      type: type,
      html: content
    }).then(function(){
			if(callbackYes){
        callbackYes();
      }
		},function(){
      if(callbackNo){
        callbackNo();
      }
    });
  },
  newsletter: function(content, callback){
    if(window.innerWidth >= 800){
      swal({
        width: 800,
        customClass: 'swal-shop-newsletter-popup',
        confirmButtonText: 'OK',
        confirmButtonClass: 'btn',
        title: 'Newsletter',
        type: 'info',
        html: [
          '<div class="container-fluid" style="background-image:url(/' + S['UPLOAD_PATH'] + '/newsletter-popup.jpg);background-size:cover;">',
            '<div class="row">',
              '<div class="col-xs-12">',
                '<div>',
                  content,
                  '<form class="newsletter-form core_addEmailToNewsletterPopup" data-valid-box>',
                    '<div class="row">',
                      '<div class="col-xxs col-xs-7 col-md-8">',
                        '<input type="text" name="email" value="" placeholder="' + L['INPUT_EMAIL'] + '" class="newsletter-input" data-valid="required|email" />',
                      '</div>',
                      '<div class="col-xxs col-xs-5 col-md-4">',
                        '<input type="submit" value="' + L['ADD_ADDRESS'] + '" class="btn newsletter-button core_addEmailToNewsletterPopup" />',
                        '<input type="hidden" value="1" class="pro-tecting-_-Input" name="is_js">',
                      '</div>',
                    '</div>',
                  '</form>',
                '</div>',
                '<i class="close-shape"></i>',
              '</div>',
            '</div>',
          '</div>'
        ].join(''),
        onClose: callback ? callback : null
      });

      $(document).on('click','.swal-shop-newsletter-popup .close-shape',function(){
        $('.swal-shop-newsletter-popup').find('.swal2-confirm').trigger('click');
      });
    }
  },
  askAboutProduct: function(productId){
    swal({
      width: 800,
      customClass: 'swal-shop-ask-about-product-popup',
      confirmButtonText: 'OK',
      confirmButtonClass: 'btn',
      title: L['ASQ_QUESTION'],
      type: null,
      html: [
        '<i class="close-shape"></i>',
        '<section class="product-opinions">',
          '<form method="POST">',
            '<table class="product-add-opinion">',
              '<tbody>',
                '<tr>',
                  '<td>',
                    '<span class="parameter-name">' + L['SIGNATURE'] + '</span>',
                  '</td>',
                  '<td>',
                    '<input class="input-field" type="text" value="' + S['USER'].name + '" placeholder="" name="username" data-valid="required" />',
                  '</td>',
                '</tr>',
                '<tr>',
                  '<td>',
                    '<span class="parameter-name">' + L['EMAIL'] + '</span>',
                  '</td>',
                  '<td>',
                    '<input class="input-field" type="text" value="' + S['USER'].email + '" placeholder="" name="email" data-valid="required|email" />',
                  '</td>',
                '</tr>',
                '<tr>',
                  '<td>',
                    '<span class="parameter-name">' + L['ASQ_QUESTION'] + '</span>',
                  '</td>',
                  '<td>',
                    '<textarea class="textarea-field" rows="4" name="text" data-valid="required"></textarea>',
                    '<input type="hidden" value="1" class="pro-tecting-_-Input" name="is_js"/>',
                  '</td>',
                '</tr>',
              '</tbody>',
            '</table>',
            '<div class="col-xs-12">',
              '<button class="btn btn-primary btn-lg btn-opinion-add core_askQuestion" data-product-id="' + productId + '">' + L['SEND'] + '</button>',
            '</div>',
          '</form>',
        '</section>'
      ].join('')
    });
    
    $(document).on('click','.swal-shop-ask-about-product-popup .close-shape',function(){
      $('.swal-shop-ask-about-product-popup').find('.swal2-confirm').trigger('click');
    });
  },
  emailRegisteredAlready: function(title,content,type,confirmButtonText,callback){
    if (!confirmButtonText) {
      confirmButtonText = `<a href="/login/">${window.L.LOGIN2}</a>`;
    } else {
      confirmButtonText = `<a href="javascript:void(0);">${confirmButtonText}</a>`;
    }

    swal({
      width: 550,
      customClass: 'swal-shop-action-popup',
      confirmButtonText: confirmButtonText,
      confirmButtonClass: 'btn already-registered',
      title: title,
      type: type,
      html: content
    }).then(function(){
      if(callback){
        callback();
      }
    });
  },
};

var cookies = {
  create: function(name,value,ms){
    var expires = '';
    if(ms){
      var date = new Date();
      date.setTime(date.getTime() + ms);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
  },
  read: function(name){
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for(var i=0;i<ca.length;i++){
      var c = ca[i];
      while(c.charAt(0)==' '){
        c = c.substring(1,c.length);
      }
      if(c.indexOf(nameEQ) == 0){
        return c.substring(nameEQ.length,c.length);
      }
    }
    return null;
  },
  erase: function(name){
    cookies.create(name,'',-1);
  }
};

$('.cookies').each(function(){
  var clone = $(this).clone();

  $(this).remove();

  $('body > .fixed-elements').append($(clone));
  $('.cookies').removeClass('hidden');
});

var addError = function(elem,content){
  var element = elem,
      style = getComputedStyle(element.get(0));
  
  if(typeof content === 'undefined'){
    content = L['ERROR_UNEXPECTED_ERROR'];
  }

  if(!element.prev().hasClass('ss-error-container')){
    element.addClass('ss-error');
    element.before(
       '<div class="ss-error-container">'
     + '<div class="ss-error-help-open" data-toggle="popover" data-content="' + content + '">'
     + '<i class="fa fa-exclamation" aria-hidden="true"></i>'
     + '</div>'
     + '</div>'
    );
    element.prev().css({
      width: style.width,
      height: style.height,
      marginTop: style.marginTop,
      marginRight: style.marginRight,
      marginBottom: style.marginBottom,
      marginLeft: style.marginLeft
    });
    element.prev().find('[data-toggle="popover"]').popover({
      title: '',
      placement: 'top',
      container: 'body',
      trigger: 'hover',
      template: '<div class="popover ss-error-popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>',
      html: true
    });
  }else{
    element.prev().find('[data-toggle="popover"]').attr('data-content',content);
  }


  
}

var removeError = function(elem){
  var element = elem,
      prev = element.prev();

  if(prev.hasClass('ss-error-container')){
    prev.find('[data-toggle="popover"]').popover('destroy');
    prev.remove();
  }
  element.removeClass('ss-error');
}

var removeAllErrors = function(elem){
  var element;

  if(typeof elem !== 'unefined'){
    element = elem.find('.ss-error');
  }else{
    element = $('.ss-error');
  }

  var prev = element.prev();

  if(prev.hasClass('ss-error-container')){
    prev.find('[data-toggle="popover"]').popover('destroy');
    prev.remove();
  }
  element.removeClass('ss-error');
}

var recalculateErrors = function(){
  var element = $('.ss-error');

  if(element.length > 0){
    element.each(function(){
      var prev = $(this).prev(),
          style = getComputedStyle($(this).get(0));

      prev.css({
        width: style.width,
        height: style.height,
        marginTop: style.marginTop,
        marginRight: style.marginRight,
        marginBottom: style.marginBottom,
        marginLeft: style.marginLeft
      });
    });
  }
}

var updateCart = function(action,data,additionalData){
  var body = $('body'),
      quickCart = $('.quick-cart'),
      quickCartProducts = quickCart.find('.products'),
      quickCartEmptyCart = quickCart.find('.cart-empty'),
      amount = quickCart.find('.core_quickCartAmount'),
      totalPrice = quickCart.find('.core_quickCartTotalPrice'),
      totalPriceBrutto = quickCart.find('.core_quickCartTotalPriceBrutto');

  switch(action){
    case 'add':
      var productTemplate = quickCartProducts.find('.product-template')[0].outerHTML,
          existProduct = quickCartProducts.find('li[data-hash="' + data.hash + '"]');

      var productAmount = existProduct.length > 0 ? Big(existProduct.data('amount')).plus(data.amount) : data.amount;

      productTemplate = productTemplate.replace(/{{:hash:}}/g,data.hash);
      productTemplate = productTemplate.replace(/{{:amount:}}/g,productAmount);
      productTemplate = productTemplate.replace(/#{{:url:}}/g,data.url);
      if (data.name.includes('$&','&amp;', '$&amp;')){
        var stringToEncode = specialCharacterNameToReplace(data.name)
        productTemplate = productTemplate.replace(/{{:name:}}/g, stringToEncode);
      }else {
        productTemplate = productTemplate.replace(/{{:name:}}/g, data.name);
      }
      productTemplate = productTemplate.replace(/{{:image:}}/g,data.img);
      productTemplate = productTemplate.replace('src="/view/new/img/transparent.png"', '');
      productTemplate = productTemplate.replace(/{{:price:}}/g,data.price);
      productTemplate = productTemplate.replace(/{{:tax:}}/g,data.tax);
      productTemplate = productTemplate.replace(/data-src/g,'src');
      productTemplate = productTemplate.replace(/data-price-type-placeholder/g,'data-price-type');
      productTemplate = $(productTemplate);
      productTemplate.removeClass('hidden');

      if(existProduct.length > 0){
        existProduct.before(productTemplate);
        existProduct.remove();
      }else{
        quickCartProducts.append(productTemplate);

        quickCartProducts.removeClass('hidden');
        quickCartEmptyCart.addClass('hidden');
      }

      amount.text(data.amount_total);
      if(body.attr('data-hurt-price-type') == 'netto_brutto' || body.attr('data-hurt-price-type') == 'netto'){
        totalPrice.text(data.sum_net);
        totalPrice.data('price',data.sum_net);
        totalPriceBrutto.text(data.sum);
        totalPriceBrutto.data('price',data.sum);
      }else{
        totalPrice.text(data.sum);
        totalPrice.data('price',data.sum);
      }

      pricesFormatter(quickCart);
    break;
    case 'remove':
      var cart = $('.cart'),
          cartTable = cart.find('.cart-table');

      additionalData.hashes.forEach(hash => {
        var currentProduct = quickCartProducts.find('li[data-hash="' + hash + '"]');

        currentProduct.transition('slideUp',100,function(){
          currentProduct.remove();

          quickCartProducts.each(function(){
            if(typeof $(this).children('li')[1] === 'undefined'){
              amount.text(0);
              totalPrice.text(0);
              totalPrice.data('price',0);
              totalPriceBrutto.text(0);
              totalPriceBrutto.data('price',0);

              quickCartProducts.transition('slideUp',25,function(){
                quickCartProducts.css('display','block');
                quickCartProducts.addClass('hidden');
                quickCartEmptyCart.removeClass('hidden');
              });
            }else{
              amount.text(data.amount_total);
              if(body.attr('data-hurt-price-type') == 'netto_brutto' || body.attr('data-hurt-price-type') == 'netto'){
                totalPrice.text(data.sum_net);
                totalPrice.data('price',data.sum_net);
                totalPriceBrutto.text(data.sum);
                totalPriceBrutto.data('price',data.sum);
              }else{
                totalPrice.text(data.sum);
                totalPrice.data('price',data.sum);
              }
            }
          });
          pricesFormatter(quickCart);
        });

        if(additionalData.inCart === true){
          var cartTr = cartTable.find('tr[data-hash="' + hash  + '"]'),
              cartTrAmount = parseFloat(cartTr.find('.core_storeCartProductAmount').val()),
              parentHash = cartTr[0]?.hasAttribute('data-parent-hash');

          if (!parentHash) {
            amount.text(data.amount_total);
          }

          if(body.attr('data-hurt-price-type') == 'netto_brutto' || body.attr('data-hurt-price-type') == 'netto'){
            totalPrice.text(data.sum_net);
            totalPrice.data('price',data.sum_net);
            totalPriceBrutto.text(data.sum);
            totalPriceBrutto.data('price',data.sum);
          }else{
            totalPrice.text(data.sum);
            totalPrice.data('price',data.sum);
          }

          cartTr.children('td').wrapInner('<div style="display:block;" />').parent().find('td > div').transition('slideUp',100,function(){
            cartTr.remove();
            delete SkyShop.cart.products[hash];
          });
        }
      });

      if (additionalData.inCart) {
        if(typeof additionalData.callback !== 'undefined'){
          additionalData.callback();
        }

        if(cartTable.find('tr[data-hash]:not(.hidden)').length == 0){
          cart.find('tbody').addClass('empty-space');
          setTimeout(function(){
            const cartEmpty = cartTable.prev();
            cartEmpty.removeClass('hidden');
          },200);
        }
      }

      pricesFormatter(quickCart);
    break;
  }
}

var slidersResize = function(sliders){
  sliders.each(function(){
    var self = $(this),
        carousel = self.find('.carousel').eq(0);

    var data = {
      maxWidth: self.data('max-width'),
      maxHeight: self.data('max-height'),
      currentWidth: carousel.width()
    };

    if(data.currentWidth < data.maxWidth){
      data.maxHeight = Big(Big(data.currentWidth).div(data.maxWidth)).times(data.maxHeight);
    }

    $().add(carousel).add(carousel.find('.item')).css('height',data.maxHeight);
  });
}

window.addEventListener('resize',function(event){
  recalculateErrors();
});

$('#header').find('.menu, .sticky-header_content__menu').find('li.click').children('a').on('click',function(e){
  e.preventDefault();

  var self = $(this),
      click = self.parent(),
      menu = click.parents('.menu').eq(0),
      stickyMenu = click.parents('.sticky-header_content__menu').eq(0),
      dropdown = click.children('.dropdown'),
      outside = $(window);

  if(!click.hasClass('clicked')){
    if(menu.find('li.clicked').length > 0 ){
      outside.off('click.menuClose');
      menu.find('li.clicked').removeClass('clicked');
    }else if(stickyMenu.find('li.clicked').length > 0){
      outside.off('click.menuClose');
      stickyMenu.find('li.clicked').removeClass('clicked');
    }

    outside.on('click.menuClose',function(e){
      if(!$(e.target).closest(click).length){
        outside.off('click.menuClose');
        click.removeClass('clicked');
      }
    });

    click.addClass('clicked');

  }else{
    outside.off('click.menuClose');
    click.removeClass('clicked');
  }
});

$('#footer').find('.section-title').not('.center').on('click',function(){
  var self = $(this),
      menu = self.next();

  if(window.innerWidth <= 767){
    if(self.hasClass('open')){
      self.removeClass('open');
      menu.slideUp(200);
    }else{
      self.addClass('open');
      menu.slideDown(200);
    }
  }
});

var loginFacebook = function(){
	FB.getLoginStatus(function(response){
		var data = {
			getApi: '/me?fields=email,first_name,last_name'
		};
		FB.getLoginStatus(function(response){
			if(response.status === 'connected'){
				FB.api(data.getApi,function(rsp){
					$.ajax({
						type: 'GET',
						url: '/login/service/facebook?email=' + rsp.email + '&first_name=' + rsp.first_name + '&last_name=' + rsp.last_name + '&id=' + rsp.id,
						success: function(data){
							if(data.success === true){
							  // GTAG EVENT 'login'
                              gtagEvent('login', {}, 'Facebook');

                              window.location = '/';

							}else{
								popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],L['LOGIN_SERVICE_NO_VALIDATE'],'error');
							}
						}
					});
				});
			}else{
				popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],L['LOGIN_SERVICE_NO_VALIDATE'],'error');
			}
		});
	});
};

function facebookLoginAction() {
  FB.login(function(response) {
    var data = {
      getApi: '/me?fields=email,first_name,last_name'
    };
    if (response.status === 'connected') {
      FB.api(data.getApi, function (rsp) {
        $.ajax({
          type: 'GET',
          url: '/login/service/facebook?email=' + rsp.email + '&first_name=' + rsp.first_name + '&last_name=' + rsp.last_name + '&id=' + rsp.id,
          success: function (data) {
            if (data.success === true) {
              // GTAG EVENT 'login'
              gtagEvent('login', {}, 'Facebook');

              window.location = '/';

            } else {
              popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'], L['LOGIN_SERVICE_NO_VALIDATE'], 'error');
            }
          }
        });
      });
    } else {
      popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'], L['LOGIN_SERVICE_NO_VALIDATE'], 'error');
    }
  }, {scope: 'public_profile,email'});
}

window.onbeforeunload = function(e){
  if(typeof gapi !== 'undefined' && gapi && gapi.auth2){
	  gapi.auth2.getAuthInstance().signOut();
  }
};

var loginGoogle = function(googleUser){
	var profile = googleUser.getBasicProfile();

	var data = {
		email: profile.getEmail(),
		firstName: profile.getGivenName(),
		lastName: profile.getFamilyName(),
		id: googleUser.getAuthResponse().id_token
	};

	if(profile && data.id){
		$.ajax({
			type: 'GET',
			url: '/login/service/google?email=' + data.email + '&first_name=' + data.firstName + '&last_name=' + data.lastName + '&id=' + data.id,
			success: function(data){
				if(JSON.parse(data).success == true){

				  //GTAG EVENT 'login'
                  gtagEvent('login', {}, 'Google');

                  window.location = '/';

				}else{
					popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],L['LOGIN_SERVICE_NO_VALIDATE'],'error');
				}
			}
		});
	}else{
		popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],L['LOGIN_SERVICE_NO_VALIDATE'],'error');
	}
};

var createSwipePanelCount = 0;
var createSwipePanel = function(direction,additionalClass,callback,callbackClose){
  var fixedElements = $('body').children('.fixed-elements');
      swipePanel = fixedElements.find('.swipe-panel'),
      swipePanelContent = swipePanel.children('.swipe-panel-content'),
      swipePanelCloseArea = swipePanel.children('.swipe-panel-close-area');
      swipePanel.data('direction',direction);
      swipePanel.addClass('open');
      swipePanelContent.attr('class','swipe-panel-content');
      swipePanelContent.empty();
      swipePanelContent.addClass(additionalClass);
      swipePanelContent.addClass(direction);
      swipePanelCloseArea.addClass(direction);

  if(createSwipePanelCount == 0) {
    createSwipePanelCount++

    const waitDistance = 30;
    const durationMax = 200;

    let swipePanelContentWidth = swipePanelContent.width();
    let distance = { start: null, current: 0 };
    let direction = swipePanel.data('direction');

    const closePanel = duration => {
      if (typeof $(document).velocity !== 'undefined') {
        swipePanelContent.velocity({
          [direction]: -swipePanelContentWidth
        }, {
          duration: duration || 200,
          complete: function() {
            swipePanelContent.attr('style','');
            swipePanelContent.attr('class','swipe-panel-content');
            swipePanel.removeClass('open');
            swipePanelCloseArea.attr('class','swipe-panel-close-area');
            if(typeof callbackClose !== 'undefined') callbackClose(swipePanelContent);
          }
        });
      } else {
        swipePanelContent.animate({
          [direction]: -swipePanelContentWidth
        },duration, function() {
          swipePanelContent.attr('style','');
          swipePanelContent.attr('class','swipe-panel-content');
          swipePanel.removeClass('open');
          swipePanelCloseArea.attr('class','swipe-panel-close-area');

          if (typeof callbackClose !== 'undefined') callbackClose(swipePanelContent);
        });
      }
    }

    const touchStart = event => {
      event.stopPropagation();
      distance.start = event.touches[0].clientX;

      swipePanel[0].addEventListener('touchcancel', (event) => {});
      swipePanel[0].addEventListener('touchmove', touchMove);
      swipePanel[0].addEventListener('touchend', touchEnd);
    }

    const touchMove = event => {
      const moveDistance = distance.start - event.touches[0].clientX;
      distance.current = direction == 'left' ? moveDistance : -moveDistance;

      if (distance.current > waitDistance) swipePanelContent.css(direction,'-' + parseInt(distance.current - waitDistance) + 'px');
    }

    const touchEnd = event => {
      event.stopPropagation();

      if (distance.current > 50 || event.target.classList.contains('swipe-panel-close-area')) {
        event.preventDefault();
        let duration = -((distance.current / swipePanelContentWidth) * durationMax - durationMax);

        closePanel(duration)
      } else if (distance.current > 0 && distance.current < 50) {
        if (typeof $(document).velocity !== 'undefined') {
          swipePanelContent.velocity({
            [direction]: 0
          });
        } else {
          swipePanelContent.animate({
            [direction]: 0
          });
        }
      }

      distance.current = 0;
    }

    swipePanel[0].addEventListener('touchstart', touchStart);
    swipePanelCloseArea[0].addEventListener('click', closePanel);
  }

  setTimeout(function(){
    swipePanelContent.addClass(direction);
    setTimeout(function(){
      swipePanelContent.addClass('open');
      callback(swipePanelContent);
      swipePanelContent.children().find($('.scrollbar-inner')).scrollbar()
    },100);
  },100);
};

$('#mobile-open-menu').on('click',function(){
  var currents = [],
      categories,
      template = {
        container: [
          '<div class="mobile-categories">',
            '<ul>',
              '{{:categories:}}',
            '</ul>',
          '</div>'
        ].join(''),
        list: [
          '<li data-id="{{:id:}}">',
            '<a href="#{{:url:}}">{{:name:}}</a>',
            '<i class="fa fa-bars open-subtree"></i>',
          '</li>'
        ].join('')
      },
      getCategoriesElements = $('#header').find('.menu').children(),
      getCategories = function(element){
        return element.children().filter(function(){
          if($(this).hasClass('search') || $(this).hasClass('hamburger')){
            return false;
          }
          return true;
        }).map(function(){
          var list = $(this).children('a'),
              item = {
                id: Math.random().toString(16).slice(2),
                name: list[0].innerText,
                url: typeof list.attr('href') !== 'undefined' ? list.attr('href') : '#'
              };

          /* ---------------------
           * Storage items from vertical menu
           */
          if($(this).hasClass('vertical-menu')){
            if($('#header').find('.header-bottom').find('.vertical-menu-content').children('ul').children('li').length > 0){
              item.children = [];

              $('#header').find('.header-bottom').find('.vertical-menu-content').children('ul').children('li').each(function(){
                var itemLevel1 = {
                  id: Math.random().toString(16).slice(2),
                  name: $(this).children('a')[0].innerText,
                  url: typeof $(this).children('a').attr('href') !== 'undefined' ? $(this).children('a').attr('href') : '#'
                }

                if($(this).children('.sub-categories').length > 0){
                  itemLevel1.children = [];

                  $(this).children('.sub-categories').children().children().children().each(function(){
                    var itemLevel2 = {
                      id: Math.random().toString(16).slice(2),
                      name: $(this).children('.cat-title').children('a')[0].innerText,
                      url: typeof $(this).children('.cat-title').children('a').attr('href') !== 'undefined' ?  $(this).children('.cat-title').children('a').attr('href') : '#'
                    }

                    if($(this).children('ul').length > 0){
                      itemLevel2.children = [];

                      $(this).children('ul').children('li').each(function(){
                        var itemLevel3 = {
                          id: Math.random().toString(16).slice(2),
                          name: $(this).children('a')[0].innerText,
                          url: typeof $(this).children('a').attr('href') !== 'undefined' ? $(this).children('a').attr('href') : '#'
                        }

                        itemLevel2.children.push(itemLevel3);
                      });
                    }

                    itemLevel1.children.push(itemLevel2);
                  });
                }

                item.children.push(itemLevel1);
              });
            }
          /* ---------------------
           * Storage items from horizontal menu
           */
          }else{
            if($(this).children('.dropdown').length > 0){
              item.children = [];

              if($(this).hasClass('single-category')){
                $(this).children('.dropdown').find('ul').eq(0).children().each(function(){
                  var itemLevel1 = {
                    id: Math.random().toString(16).slice(2),
                    name: $(this).children('a')[0].innerText,
                    url: $(this).children('a').attr('href')
                  }
                  item.children.push(itemLevel1);
                });
              }
              if($(this).hasClass('full-width')){
                $(this).children('.dropdown').find('.cat-title').each(function(){
                  var itemLevel1 = {
                    id: Math.random().toString(16).slice(2),
                    name: $(this).children('a')[0].innerText,
                    url: $(this).children('a').attr('href')
                  }

                  if($(this).next().length > 0){
                    itemLevel1.children = [];

                    $(this).next().children().each(function(){
                      var itemLevel2 = {
                        id: Math.random().toString(16).slice(2),
                        name: $(this).children('a')[0].innerText,
                        url: $(this).children('a').attr('href')
                      }

                      itemLevel1.children.push(itemLevel2);
                    });
                  }

                  item.children.push(itemLevel1);
                });
              }
            }
          }

          return item;
        }).get();
      },
      renderMobileCategories = function(list,first){
        var renderList = '',
            renderContainer = template.container,
            cloneList = JSON.parse(JSON.stringify(list));

        if(typeof first !== 'undefined' && first === true){
          cloneList.unshift('back');

          renderContainer = $(renderContainer);
          renderContainer.addClass('fade-in');
          renderContainer = renderContainer.prop('outerHTML');
        }

        cloneList.forEach(function(item){
          var render = template.list;

          if(item == 'back'){
            render = render.replace(/{{:id:}}/g,item.id);
            render = render.replace(/{{:name:}}/g,L.BACK_BTN_LABEL);
            render = render.replace(/#{{:url:}}/g,'#');

            render = $(render);

            render.addClass('close-subtree');
            render.removeAttr('data-id');
            render.find('i').attr('class','fa fa-angle-left')
          }else{
            render = render.replace(/{{:id:}}/g,item.id);
            render = render.replace(/{{:name:}}/g,item.name);
            render = render.replace(/#{{:url:}}/g,item.url);

            render = $(render);

            if(typeof item.children === 'undefined'){
              render.find('i').remove();
            }
          }

          render = render.prop('outerHTML');

          renderList += render;
        });

        return $(renderContainer.replace(/{{:categories:}}/g,renderList));
      };

  categories = getCategories(getCategoriesElements);

  createSwipePanel('left','categories',function(content){
    content.append(renderMobileCategories(categories));

    content.on('click.mobileCategoriesOpen','.open-subtree',function(e){
      e.preventDefault();

      var self = $(this),
          id = self.parents('li').eq(0).data('id'),
          current = categories,
          currentRender;

      currents.push(id);
      currents.forEach(function(single){
        current.forEach(function(item){
          if(item.id == single){
            current = item.children;
          }
        });
      });

      currentRender = renderMobileCategories(current,true)

      content.append(currentRender);
      setTimeout(function(){
        currentRender.removeClass('fade-in');
      },100);
    });

    content.on('click.mobileCategoriesClose','.close-subtree',function(e){
      e.preventDefault();

      var self = $(this),
          subTree = content.find('.mobile-categories').last();

      currents.pop();

      subTree.addClass('fade-in');

      setTimeout(function(){
        subTree.remove();
      },100);
    });
  },function(content){
    content.off('click.mobileCategoriesOpen click.mobileCategoriesClose');
  });
});

$('#mobile-open-cart').on('click',function(){
  var windowWidth = window.innerWidth;
  var pathName = window.location.pathname;
  var cartPathName = "/cart/";
  
  // avoid opening cart widget while conditions for : cart page and mobile view are true
  if(pathName === cartPathName && windowWidth <= 1024){
    return false;
  }
  createSwipePanel('right','quick-cart',function(content){
    var cart = $('.top_bar_item_list_item.quick-cart > .dropdown.dropdown-quick-cart').clone();
    content.append(cart);
  });
});

$('#mobile-open-search').on('click', function(){
  var self = $(this),
      body = $('body > main'),
      mobileSearch = body.find('section.mobile-search').find('input[type="text"]'),
      mobileSearchLength = mobileSearch.val().length,
      $quickSearch = $('.core_quickSearchAjaxHints');

  if(self.hasClass('active')){
    self.removeClass('active');
    body.removeClass('mobile-search-show');
    mobileSearch.trigger('blur');
    $quickSearch.addClass('hidden')
  }else{
    self.addClass('active');
    body.addClass('mobile-search-show');
    mobileSearch.trigger('focus');
    if(mobileSearchLength >= 3){
      $quickSearch.removeClass('hidden')
    }else{
      $quickSearch.addClass('hidden')
    }
  }
});

$('#mobile-open-contact').on('click',function(){
  var self = $(this),
      patterns = {
        sections: {
          contact: [
            '<span class="section">' + L['CONTACT'] + '</span>',
            '<div class="icons">{{:icons:}}</div>'
          ],
          socials: [
            '<span class="section">' + L['YOU_ARE_US_ON'] + '</span>',
            '<div class="icons">{{:icons:}}</div>'
          ]
        },
        elements: {
          contact: [
            '<a href="{{:url:}}" {{:target:}}>',
              '<i class="fa fa-{{:icon:}}"></i> <span class="value">{{:value:}}</span>',
            '</a>',
            '<br />'
          ],
          social: [
            '<a href="{{:url:}}" {{:target:}}>',
              '<i class="fa fa-{{:icon:}}"></i>',
            '</a>'
          ]
        }
      },
      elements = {
        contact: [],
        socials: []
      };
  $(self.prevAll('[data-type]').get().reverse()).each(function(){
    const self = $(this),
        type = self.data('type'),
        url = self.find('a').attr('href'),
        icon = self.find('i').length ? self.find('i').attr('class').split('fa-')[1].split(' ')[0] : null;
    let pattern;

    if(typeof type.split('social-sm_')[1] === 'undefined'){
      pattern = patterns.elements.contact.join('');
      pattern = pattern.replace(/{{:url:}}/g,url);
      pattern = pattern.replace(/{{:icon:}}/g,icon);
      pattern = pattern.replace(/{{:value:}}/g,url.split(':')[1]);
      pattern = pattern.replace(/{{:target:}}/g,'');
      elements.contact.push(pattern);
    }else{
       icon === null
         ? pattern = ''
         : pattern = patterns.elements.social.join('');
           pattern = pattern.replace(/{{:url:}}/g, url);
           pattern = pattern.replace(/{{:icon:}}/g, icon);
           pattern = pattern.replace(/{{:target:}}/g, 'target="_blank"');
           elements.socials.push(pattern);

    }
  });

  patterns.sections.contact = patterns.sections.contact.join('');
  patterns.sections.socials = patterns.sections.socials.join('');

  patterns.sections.contact = patterns.sections.contact.replace(/{{:icons:}}/g,elements.contact.join(''));
  patterns.sections.socials = patterns.sections.socials.replace(/{{:icons:}}/g,elements.socials.join(''));

  createSwipePanel('left','mobile-contact',function(content){
    content.append($([
      patterns.sections.contact,
      patterns.sections.socials
    ].join('')));
  });
});

$('section.mobile-search').find('.close-shape').on('click',function(){
  var button = $('#mobile-open-search');
  body = $('body > main'),
  $quickSearch = $('.core_quickSearchAjaxHints');

  button.removeClass('active');
  body.removeClass('mobile-search-show');
  $quickSearch.addClass('hidden');
});


$(window).on('load.slidersResize resize.slidersResize',function(){
  var sliders = $('section.slider');

  if(sliders.length > 0){
    slidersResize(sliders);
  }else{
    $(this).off('load.slidersResize resize.slidersResize');
  }
});

$(document).on('ready',function(){
  var sliders = $('section.slider');

  if(sliders.length > 0){
    slidersResize(sliders);
  }

  if(window.location.href.indexOf('opt_required=1') > -1){
    var productCard = $('.product-card'),
        addToCart = productCard.find('.core_addToCart').eq(0);

    addToCart.trigger('click');

    popups.actionAlert(L['INFORMATION'],L['OPT_REQIRED_INFO'],'info');
  }

  $('.scrollbar-inner').scrollbar();
  $('.scrollbar-inner')
    .on('mouseenter',function(){
      $(this).on('mousewheel DOMMouseScroll',function(e){
          var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;

        this.scrollTop += (delta < 0 ? 1 : -1) * 50;
        e.preventDefault();
      });
    })
    .on('mouseleave',function(){
      $(this).off('mousewheel DOMMouseScroll');
    });
});

$('.datetime-field[data-type="date"]').datetimepicker({
  language: S['LANG'],
  orientation: 'right',
  pickTime: false,
  pickSeconds: false,
  weekStart: 1,
  startDate: new Date(),
  endDate: new Date(
    new Date().getFullYear() + 1,
    new Date().getMonth(),
    new Date().getDate()
  )
});
$('.datetime-field[data-type="datetime"]').datetimepicker({
  language: S['LANG'],
  orientation: 'right',
  pickTime: true,
  pickSeconds: false,
  weekStart: 1,
  startDate: new Date(),
  endDate: new Date(
    new Date().getFullYear() + 1,
    new Date().getMonth(),
    new Date().getDate()
  )
});
$('.datetime-field').on('click','.add-on-input',function(){
  $(this).parent().find('.add-on').trigger('click');
});

$('.rate-field.choice').find('.stars').find('.fa-star-o')
  .on('mouseenter',function(){
    var self = $(this),
        parent = self.parents('.rate-field'),
        placeholder = parent.find('.stars-placeholder'),
        value = ((self.data('value') * 10 / parent.find('.fa-star-o').length) * 10) + '%';

    placeholder.css('width',value);
  })
  .on('click',function(){
    var self = $(this),
        parent = self.parents('.rate-field'),
        input = parent.find('.rate-value'),
        placeholder = parent.find('.stars-placeholder'),
        value = ((self.data('value') * 10 / parent.find('.fa-star-o').length) * 10) + '%';

    placeholder.css('width',value);
    input.val(self.data('value'));
  });

$('.rate-field.choice').find('.stars')
  .on('mouseleave',function(e){
      var self = $(this),
          parent = self.parents('.rate-field'),
          input = parent.find('.rate-value'),
          placeholder = parent.find('.stars-placeholder');

      if(input.val() == ''){
        placeholder.css('width','0%');
      }else{
        var value = ((parseInt(input.val()) * 10 / parent.find('.fa-star-o').length) * 10) + '%';
        placeholder.css('width',value);
      }
  });

function scrollToRate () {
  $('html, body').animate({
    scrollTop: $("#product-tabs").offset().top - 50
  },'slow',function(){

    if ($('#product-tabs [data-rel-tab=comments]').length === 0 ){

      $("#product-tabs [data-tab=description]").addClass('active');
      $("#product-tabs [data-tab=description]").css( "opacity", "1" );
      $("#product-tabs [data-tab=description]").removeClass( "tab-hidden")
    }else if(!$('#product-tabs [data-rel-tab=comments]').hasClass("active")) {

      $("#product-tabs [data-rel-tab]").removeClass( "active")
      $("#product-tabs [data-rel-tab=comments]").addClass('active');

      $("#product-tabs .tab").addClass('tab-hidden');
      $("#product-tabs .tab").css( "opacity", "0" );

      $("#product-tabs [data-tab=comments]").css( "opacity", "1" );
      $("#product-tabs [data-tab=comments]").removeClass( "tab-hidden")
    }


  });
}

$('#average-product-rating-link').on('click',function(){
  scrollToRate();
});

$('.heading ul.nav li').on('click',function(){
  if(!$(this).hasClass('active')){
    var self = $(this),
        active = self.parent().find('li.active'),
        index = $(this).attr('data-rel-tab') ? $(this).attr('data-rel-tab') : parseInt(self.index() + 1),
        group = $(self.parents()[2]),
        current = group.find('.tab').not('.tab-hidden'),
        currentHeight = current.outerHeight(true),
        tab = group.find('[data-tab="' + index + '"]'),
        tabHeight = tab.outerHeight(true),
        wasSlider = current.hasClass('carousel'),
        isSlider = tab.hasClass('carousel'),
        isSliderName;

    active.removeClass('active');
    self.addClass('active');
    tab.height(currentHeight);

    current.animate({
      opacity: 0
    },0,function(){
      current.addClass('tab-hidden');
      tab.css('opacity',0);

      if(wasSlider){
        current.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
        current.find('.owl-stage-outer').children().unwrap();
      }

      tab.removeClass('tab-hidden');

      if(isSlider){
        isSliderName = tab.data('carousel-name');

        carousels[isSliderName]();
      }

      setTimeout(function(){
        if(typeof $(document).velocity !== 'undefined'){
          tab.velocity({
            opacity: 1
          },50,function(){
            tab.attr('style',function(i,style){
              return style.replace(/height[^;]+;?/g,'');
            });
          });
        }else{
          tab.animate({
            opacity: 1
          },50,function(){
            tab.attr('style',function(i,style){
              return style.replace(/height[^;]+;?/g,'');
            });
          });
        }
      },0);
    });
  }
});

$('.categories.slides').find('a').on('click',function(e){
  e.preventDefault();

  var self = $(this),
      childs = $(this).next();

  if(childs.hasClass('active')){
    self.removeClass('revert');
    childs.removeClass('active');
    childs.slideUp(200);
  }else{
    self.addClass('revert');
    childs.addClass('active');
    childs.slideDown(200);
  }
});

$('.categories.dropdowns > ul > li, .categories.dropdowns > ul > li > ul > li').children('a.rolldown').on('click',function(e){
  e.preventDefault();

  var self = $(this),
      childs = $(this).next();

  if(childs.hasClass('active')){
    self.removeClass('revert');
    childs.removeClass('active');
    childs.slideUp(200);
  }else{
    self.addClass('revert');
    childs.addClass('active');
    childs.slideDown(200);
  }
});

function isResponsiveImageChecker(){
  var blogContainer = $('.post-content').innerWidth();
      blogImage = $('.post-content').find('img');

  for( var i = 0;  i < blogImage.length ; i++){
      blogImageWidth = blogImage[i].offsetWidth;

    if(blogImageWidth > blogContainer){
      $(blogImage[i]).addClass('responsive-image');
    }
  }
}
isResponsiveImageChecker();

initializeSelect2();


// protecting shop forms from spam bots
function addSpamProtectionToForms(){
  // array of forms you want to protect
  // note that you have to specify correct selector by using "." for class name or "#" for id
  var formHandlersArray = [
    '.newsletter-form',
    '.popupContent form',
    '.newsletter form',
    '.contentSidebar form',
    '.product-opinions form',
    '.core_addTicket',
    '.core_sendPhone',
    '.core_addOpinion',
    '.core_askQuestion',
    '.core_addEmailToNewsletter',
    '.order form'
  ];
  var isJs = 'is_js-true';
  var protectingInput = '<input type="hidden" value="1" class="pro-tecting-_-Input" name="'+isJs.split('-')[0]+'"/>';

  // check every selector from the array
  for(formHandler of formHandlersArray){
    var form = $(document).find($(formHandler));
    // if element exists in document and doesn't contain protecting input:
    if(form[0] && !form.find('.pro-tecting-_-Input').length){
      form.append(protectingInput);
    }
  }
}
addSpamProtectionToForms();

function jsHash(hash) {
  this.key = 'js_hash';
  this.oldValue = cookies.read(this.key);

  if( hash && (!this.oldValue || this.oldValue !== hash) ) {
    cookies.create(this.key, hash, 60*60*24*1000);
  }
}
jsHash($('body').data('js-hash'));

// TEXT PARAMETER

$('.text-parameter-box').each(function(){
  var counter =  $(this).parent().find($('.text-parameter-counter'))
  $(this).bind('input', function (e){
    e.preventDefault()
    counter.text($(this).text().length + ' ' + ' / ' + $(this).data('limit-length'))
    if($(this).text().length > $(this).data('limit-length')) {
      $(this).data('required-error', ' ' + L['TEXT_OPTION_MAX_LENGTH'] +' 1-'+$(this).data('limit-length') +'  ')
      addError($(this).parent(), $(this).data('required-error'))
      if($(this).parent().hasClass('ss-error')){
        $(this).parent().parent().css({position: 'relative'})
        $(this).parent().parent().find($('.ss-error-container')).css({height: 'auto', position: 'absolute', top: 0, bottom: 0, margin: '0 0 0 5px'})
      }
    }else{
      $(this).data('required-error', L['OPTION_REQUIRED_FILL'])
      removeError($(this).parent())
    }
    if($(this).text().trim().length >= 1 && $(this).text().trim().length < $(this).data('limit-length') + 1){
      $(this).attr('data-additionals-valid', true)
    }else{
      $(this).attr('data-additionals-valid', false)
    }
  })
})

//ORDER LOGIN

$('#order-login-btn').on('click', function(e){
  e.preventDefault()
  if(!$('input[name="order-email"]').val() || !$('input[name="order-password"]').val()){
    formValidator($('.order_login'))
  }else {
    $.ajax({
      type: 'POST',
      url: '/login?json=1',
      data: {
        email: $.base64Encode($('input[name="order-email"]').val()),
        password: $.base64Encode($('input[name="order-password"]').val()),
      },
      success: function (response) {

        if(typeof response === 'string') {
          response = JSON.parse(response);
        }

        if (response.status === 'LOGGED IN') {
          popups.actionAlert(L['INFORMATION'], L['LOGIN_SUCCESS'], 'success');

          $('.order-password-remeber').remove()
          $('.order_login').find('[name="order-email"]').attr('disabled','disabled')
          $('.order_login').find('[name="order-password"]').attr('disabled','disabled')
          $('#order-login-btn').attr('disabled','disabled').off('click')
          $('#order-login-btn').css({marginTop: '34px'})

          $('[data-not-logged]').each(function (){
            $(this).removeClass('hidden')
          })
          if($('.order').find($('div[data-not-logged]').find('input.ss-error')).length > 0){
            removeError($('.order').find($('div[data-not-logged]')).find('.ss-error'))
          }
          $('#order-login-btn').data('loginValidated', 'true')
          removeError($('#order-login-btn').parent().find('.ss-error'))

          $('[data-profile-option="register"]').addClass('hidden')
          $('[data-profile-option="no_register"]').addClass('hidden')

          response.user_bill_company ? $('input[name="user_company"]').val(response.user_bill_company) : $('[name="user_company"]').val('')
          response.user_firstname ? $('input[name="user_firstname"]').val(response.user_firstname) : $('[name="user_firstname"]').val('')
          response.user_lastname ? $('input[name="user_lastname"]').val(response.user_lastname) : $('[name="user_lastname"]').val('')
          response.user_city ? $('input[name="user_city"]').val(response.user_city) : $('[name="user_city"]').val('')
          response.user_code ? $('input[name="user_code"]').val(response.user_code) : $('[name="user_code"]').val('')
          response.user_bill_street ? $('input[name="user_street"]').val(response.user_bill_street) : $('[name="user_street"]').val('')
          response.user_phone ? $('input[name="user_phone"]').val(response.user_phone) : $('[name="user_phone"]').val('')

          // GTAG EVEENT 'login'
          gtagEvent('login', {}, 'email');
        } else {
          popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'], response.user_error, 'error');
        }
      }
    });
  }

})
//AVERAGE RATE SCROLL
$(document).on('ready',function(){
  if(window.location.href.includes('#scr')){
    scrollToRate()
  }
})

//SUB OPTIONS
$(document).on('ready',function(){

  var subProductsWrapper = $('.sub-products-wrapper')
  var subProduct = $('.sub-product')
  if($('.mod-product-card-1').find(subProductsWrapper).length) {
    if(subProductsWrapper.find(subProduct).length >= 3)
      switch(subProductsWrapper.find(subProduct).length) {
        case 3 :
          $('.sub-products-container').addClass('three-col-container')
          subProductsWrapper.find(subProduct).addClass('three-col')
          break;
        case 4:
          $('.sub-products-container').addClass('four-col-container')
          subProductsWrapper.find(subProduct).addClass('four-col')
          break;
        case 5 :
          $('.sub-products-container').addClass('five-col-container')
          subProductsWrapper.find(subProduct).addClass('five-col')
          break;
        default :
          $('.sub-products-container').addClass('six-col-container')
          subProductsWrapper.find(subProduct).addClass('six-col')
          $('.sub-products-container')
              .on('initialized.owl.carousel changed.owl.carousel refreshed.owl.carousel',function(event){
                if(!event.namespace){ return; }
                var carousel = event.relatedTarget,
                    element = event.target,
                    current = carousel.current();
                  $('.owl-next',element).toggleClass('disabled',current === carousel.maximum() || carousel.maximum() === -1);
                  $('.owl-prev',element).toggleClass('disabled',current === carousel.minimum());

              })
              .owlCarousel({
                loop: true,
                margin: 30,
                nav: true,
                dots: false,
                autoplayHoverPause: true,
                navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
                responsive: {
                  0: {
                    items: 1
                  },
                  450: {
                    items: 2
                  },
                  768: {
                    items: 3
                  },
                  930: {
                    items: 4
                  },
                  1060: {
                    items: 6
                  }
                }
              })
          break;
      }
  }else if($('.mod-product-card-2').find($('.sub-products-wrapper')).length){
    if(subProductsWrapper.find(subProduct).length >= 3){
      switch(subProductsWrapper.find('.sub-product').length) {
        default  :
          $('.sub-products-container').addClass('card-mod2')
        subProductsWrapper.find(subProduct).addClass('four-col-mod2')
          $('.sub-products-container')
              .on('initialized.owl.carousel changed.owl.carousel refreshed.owl.carousel',function(event){
                if(!event.namespace){ return; }
                var carousel = event.relatedTarget,
                    element = event.target,
                    current = carousel.current();
                $('.owl-next',element).toggleClass('disabled',current === carousel.maximum() || carousel.maximum() === -1);
                $('.owl-prev',element).toggleClass('disabled',current === carousel.minimum());

              })
              .owlCarousel({
                loop: true,
                margin: 30,
                nav: true,
                dots: false,
                autoplayHoverPause: true,
                navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
                responsive: {
                  0: {
                    items: 1
                  },
                  450: {
                    items: 2
                  },
                  768: {
                    items: 3
                  },
                  930: {
                    items: 3
                  },
                  1060: {
                    items: 3
                  }
                }
              })
          break;
      }
    }
  }

  function subProductsCarousel () {
    var checkWidth = $(window).width();
    var subProductsWrapper = $('.sub-products-container')

    if (   subProductsWrapper.hasClass('three-col-container')
        || subProductsWrapper.hasClass('four-col-container')
        || subProductsWrapper.hasClass('five-col-container')
        && !subProductsWrapper.hasClass('six-col-container')
        && !subProductsWrapper.hasClass('second-mod')) {
      if (checkWidth > 992) {
        if (subProductsWrapper.data('owlCarousel') !== undefined) {
          subProductsWrapper.data('owlCarousel').destroy();
          subProductsWrapper.removeClass('owl-carousel owl-theme owl-loaded');
          subProductsWrapper.find('.owl-stage-outer').children().unwrap();
          subProductsWrapper.removeData();
        }
      } else if (checkWidth < 992) {
        if (subProductsWrapper.data('owlCarousel') !== undefined){
          subProductsWrapper.data('owlCarousel').destroy();
          subProductsWrapper.removeClass('owl-carousel owl-theme owl-loaded');
          subProductsWrapper.find('.owl-stage-outer').children().unwrap();
          subProductsWrapper.removeData();
          subProductsWrapper.addClass('owl-carousel owl-theme owl-loaded');
          subProductsWrapper.owlCarousel({
            touchDrag: true,
            mouseDrag: true,
            autoplay: false,
            loop: true,
            nav: true,
            dots: false,
            navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
            margin: 30,
            responsive: {
              0: {
                items: 1
              },
              450: {
                items: 2
              },
              768: {
                items: 3
              },
            }
          });
        } else {
          subProductsWrapper.owlCarousel({
            touchDrag: true,
            mouseDrag: true,
            loop: true,
            nav: true,
            dots: false,
            navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
            margin: 30,
            responsive: {
              0: {
                items: 1
              },
              450: {
                items: 2
              },
              768: {
                items: 3
              },
            }
          });
        }
      }
    }
  }

  subProductsCarousel()
  $(window).resize(subProductsCarousel);
});

// CLEAR MOBILE SEARCH

$(document).on('ready',function(){
  const mobileSearchInput = document.querySelector('.clearbox input');
  const mobileSearchClearButton = document.querySelector('.clearbox .clearbox_button');

  if (mobileSearchInput && mobileSearchClearButton) {
    const toggleClearButton = () => mobileSearchClearButton.style.display = mobileSearchInput.value.length > 0 ? 'block' : 'none';

    ['input', 'focus'].forEach(event => mobileSearchInput.addEventListener(event, toggleClearButton, false));

    mobileSearchClearButton.onclick = () => {
      mobileSearchInput.value = '';
      mobileSearchInput.focus();
    }
  }
});

const throttle = (callback, timeInterval) => {
  let inThrottle;

  return (e) => {
    if (!inThrottle) inThrottle = setTimeout(() => (callback(e), inThrottle = undefined), timeInterval);
  }
}

const initSmartMenu = (menuElement) => {
  let mousePositions = [];
  let activeMenuItem;
  let lastDelayLocation;
  let dropdownPosition;
  let delayTime = 350;
  let timeout;
  const throttleTime = 100;
  const menu = menuElement.querySelector('.smart-menu > ul');

  if (menu.length = 0) return

  let menuItems = menu.querySelectorAll(':scope > li:not(.click)');

  if (menu.classList.contains('menu-hambureger') || menu.classList.contains('hambureger-elements')) menuItems = menu.querySelectorAll(':scope > li');

  const onMouseMove = e => {
    mousePositions.push({ x: e.pageX, y: e.pageY });
    mousePositions.length > 3 && mousePositions.shift();
  }

  const setDropdownPosition = dropdown => {
    const dropdownRect = dropdown.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    if (menuRect.bottom <= dropdownRect.top) return 'bottom';
    if (menuRect.top >= dropdownRect.bottom) return 'top';
    if (menuRect.right <= dropdownRect.left) return 'right';
    if (menuRect.left >= dropdownRect.right) return 'left';
  }

  const onMenuItemEnter = e => {
    const dropdown = e.target.querySelector('.dropdown');

    if (timeout) clearTimeout(timeout);
    if (dropdown) dropdownPosition = setDropdownPosition(dropdown);

    possiblyActivate(e.target)
  }

  const onMenuLeave = () => {
    if (timeout) clearTimeout(timeout);
    let leaveTimeout;

    leaveTimeout = setTimeout(() => {
      if (activeMenuItem && activeMenuItem.querySelector('.dropdown--is-open')) {
        activeMenuItem.querySelector('.dropdown').classList.remove('dropdown--is-open');
        activeMenuItem = null;
      }
    }, 150)

    menu.onmouseenter = () => clearTimeout(leaveTimeout)
  }

  const activateMenuItem = element => {
    if (element === activeMenuItem) return
    let dropdown;

    if (activeMenuItem) {
      dropdown = activeMenuItem.querySelector('.dropdown');

      if (dropdown) {
        dropdown.classList.remove('dropdown--is-open');
      }

      activeMenuItem = null;
    }

    activeMenuItem = element;
    dropdown = activeMenuItem.querySelector('.dropdown');

    if (dropdown) {
      dropdown.classList.add('dropdown--is-open');
    }
  }

  const possiblyActivate = element => {
    const delay = getActivationDelay();

    if (delay) {
      timeout = setTimeout(function() {
        possiblyActivate(element);
      }, delay);
    } else {
      activateMenuItem(element);
    }
  }

  const getActivationDelay = () => {
    let prevLocation = mousePositions[0];
    const location = mousePositions[mousePositions.length - 1];
    const menuRect = menu.getBoundingClientRect();
    const menuOffset = {
      topLeft: { x: menuRect.left, y: window.scrollY + menuRect.top - 100 },
      topRight: { x: menuRect.right, y: window.scrollY + menuRect.top + 100 },
      bottomRight: { x: menuRect.right, y: window.scrollY + menuRect.bottom },
      bottomLeft: { x: menuRect.left, y: window.scrollY + menuRect.bottom }
    }

    if (!activeMenuItem || !location) return 0

    if (!prevLocation) prevLocation = location;

    if (lastDelayLocation && location.x === lastDelayLocation.x && location.y === lastDelayLocation.y) return 0

    const slope = (a, b) => (b.y - a.y) / (b.x - a.x);
    let decreasingCorner;
    let increasingCorner;

    if (dropdownPosition === 'right') {
      decreasingCorner = menuOffset.topRight;
      increasingCorner = menuOffset.bottomRight;
    } else if (dropdownPosition === 'left') {
      decreasingCorner = menuOffset.bottomLeft;
      increasingCorner = menuOffset.topLeft;
    } else if (dropdownPosition === 'bottom') {
      decreasingCorner = menuOffset.bottomLeft;
      increasingCorner = menuOffset.bottomRight;
    } else {
      decreasingCorner = menuOffset.topLeft;
      increasingCorner = menuOffset.topRight;
    }

    const decreasingSlope = slope(location, decreasingCorner);
    const increasingSlope = slope(location, increasingCorner);
    const prevDecreasingSlope = slope(prevLocation, decreasingCorner);
    const prevIncreasingSlope = slope(prevLocation, increasingCorner);

    if (decreasingSlope < prevDecreasingSlope && increasingSlope > prevIncreasingSlope) {
      lastDelayLocation = location;
      return delayTime;
    }

    lastDelayLocation = null;
    return 0;
  }

  menu.onmouseleave = onMenuLeave;
  menu.onmousemove = throttle(onMouseMove, throttleTime);
  menuItems.forEach(element => element.addEventListener('mouseenter', onMenuItemEnter, false));
}

$(document).on('ready',function(){
  document.querySelectorAll('.smart-menu').forEach(menu => initSmartMenu(menu));
});

$('#categoryCarousel').slick({
  slidesToShow: 3,
  slidesToScroll: 2,
  infinite: true,
  speed: 200,
  centerMode: true,
  autoplay: true,
  arrows: false,
  variableWidth: true
});

$('#bdsm-show-all').on('click', function(e){
  e.preventDefault()
  $('#hidden-bdsm-categories-list').toggleClass("bdsm-categories-list-active");
  $('#bdsm-show-all').toggleClass("show-all-button-hidden");
  $('#bdsm-close-all').toggleClass("show-all-button-active");
  $('#bdsm-section-background').toggleClass("bdsm-section-bg-container-higher");
});

$('#bdsm-close-all').on('click', function(e){
  e.preventDefault()
  $('#hidden-bdsm-categories-list').toggleClass("bdsm-categories-list-active");
  $('#bdsm-show-all').toggleClass("show-all-button-hidden");
  $('#bdsm-close-all').toggleClass("show-all-button-active");
  $('#bdsm-section-background').toggleClass("bdsm-section-bg-container-higher");
});

$('#erotic-pharmacy-show-all').on('click', function(e){
  e.preventDefault()
  $('#hidden-erotic-pharmacy-categories-list').toggleClass("erotic-pharmacy-categories-list-active");
  $('#erotic-pharmacy-show-all').toggleClass("show-all-button-hidden");
  $('#erotic-pharmacy-close-all').toggleClass("show-all-button-active");
  $('#erotic-pharmacy-background-container').toggleClass("erotic-pharmacy-bg-container-higher");
  $('#erotic-pharmacy-content-id').toggleClass("erotic-pharmacy-content-expand");
});

$('#erotic-pharmacy-close-all').on('click', function(e){
  e.preventDefault()
  $('#hidden-erotic-pharmacy-categories-list').toggleClass("erotic-pharmacy-categories-list-active");
  $('#erotic-pharmacy-show-all').toggleClass("show-all-button-hidden");
  $('#erotic-pharmacy-close-all').toggleClass("show-all-button-active");
  $('#erotic-pharmacy-background-container').toggleClass("erotic-pharmacy-bg-container-higher");
  $('#erotic-pharmacy-content-id').toggleClass("erotic-pharmacy-content-expand");
});

$('#erotic-pharmacy-close-all').on('click', function(e){
  e.preventDefault()
  $('#hidden-erotic-pharmacy-categories-list').toggleClass("erotic-pharmacy-categories-list-active");
  $('#erotic-pharmacy-show-all').toggleClass("show-all-button-hidden");
  $('#erotic-pharmacy-close-all').toggleClass("show-all-button-active");
  $('#erotic-pharmacy-background-container').toggleClass("erotic-pharmacy-bg-container-higher");
  $('#erotic-pharmacy-content-id').toggleClass("erotic-pharmacy-content-expand");
});

function toggleDropdown(dropdownId) {
  var dropdown = document.getElementById(dropdownId);
  dropdown.classList.toggle("dropdown--is-open");
  console.log('1');
}

// Close the dropdown menus if the user clicks outside of them
window.onclick = function(event) {
  if (!event.target.matches('.dropdownButton')) {
    var dropdowns = document.getElementsByClassName("dropdown");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('dropdown--is-open')) {
        openDropdown.classList.remove('dropdown--is-open');
      }
    }
  }
}