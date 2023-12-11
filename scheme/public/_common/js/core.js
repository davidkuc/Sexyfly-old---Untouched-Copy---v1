/* ================================================================================================================
 * SET GLOBAL VARIABLES
 */

window.SkyShop = {
  cart: {
    products: {},
    ajaxHash: []
  },
  order: {
    paymentId: null,
    shipments: {},
    shipmentsParsed: {},
    shipmentPrice: null,
    shipmentSelected: null,
    overheadValue: '0.00',
    userCountry: null,
    initialCalculations: null,
    wdt: null,
    calculations: null,
    freeDeliveryCoupon: null,
    shipmentStreetPickedFromMap: null,
  },
  card: {
    stocks: {
      pattern: {
        stocks: null,
        stocksSelected: {},
        stocksSelectedLast: {},
        stocksSelectedLastGroup: null
      },
      storable: {},
      allowStockRequest: false,
    },
    counterError: null
  },
  core: {
    quickSearchAjax: null,
    orderCalculationAjax: null
  },
  shipment: {
    specialFunctionMethods: {},
  },
  product: {
    imgId: null
  },
  debug: function (callback) {
    callback = callback || function () {};
    if ($('body').attr('data-debug') == "true") {
      callback();
      return true;
    } else {
      return false;
    }
  }
};
/* ================================================================================================================
 * MESSAGE LIST SHOW
 */

$(document).find('.core_messageListShow').each(function(){
  var self = $(this);

  var data = {
    messages: typeof self.data('messages-list') !== 'undefined' ? self.data('messages-list').split('>:<') : [],
    errors: typeof self.data('errors-list') !== 'undefined' ? self.data('errors-list').split('>:<') : [],
    contents: [],
    showPopupsRecurency: function(messages){
      if(messages.length == 0){
        return;
      }

      var message = messages[0].split('|'),
          message = {
            title: message[0].slice(1,-1),
            content: message[1].slice(1,-1),
            type: message[2].slice(1,-1),
            btnText: (message[3] || '').toString().slice(1,-1)
          };

      messages.shift();

      if(messages){
        popups.emailRegisteredAlready(message.title, message.content,
            message.type, message.btnText, function() {
              data.showPopupsRecurency(messages);
            });
      }
    }
  };

  data.contents = data.messages.concat(data.errors);

  data.showPopupsRecurency(data.contents);
});


/* ================================================================================================================
 * COMMON ALERT SHOP CLOSE
 */

$(document).on('click','.core_commonAlertShopClose',function(e){
  e.preventDefault();

  window.location = '/login/';
});


/* ================================================================================================================
 * COMMON ALERT SHOP CLOSE
 */

$(document).on('click','.core_commonAlertConditionalAccess',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {
    type: self.data('type'),
    alert: self.parents('.skyshop-alert-shop-close').eq(0),
    isSweetAlert: $('.swal2-container').hasClass('fade in')
  };

  switch(data.type){
    case 'yes':
      data.alert.transition('fadeOut',200,function(){
        data.alert.remove();
        cookies.create('ca_yes',1,31536000000);

        if(!data.isSweetAlert){
          $('html,body').removeClass('prevent-scroll');
          $('html,body').removeClass('prevent-scroll-desktop');
        }
      });
      break;
    case 'no':
      window.history.back();
      break;
  }
});


/* ================================================================================================================
 * PARSE FORM
 */

$(document).on('submit','.core_parseForm',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {
    validate: formValidator(self),
    storage: formStorage(self),
    isEncoding: typeof self.data('encode') !== 'undefiend' && self.data('encode') == true ? true : false
  };
  if(data.validate){
    if(data.isEncoding){
      self.after($([
        '<form class="hidden" method="' + self.attr('method') + '" action="' + self.attr('action') + '">',
        self.serializeArray().map(function(option){
          return '<input name="' + option.name + '" value="' + encodeURIComponent(option.value) + '" />';
        }).join(''),
        self.find('[type="submit"]').eq(0)[0].outerHTML,
        '</form>'
      ].join('')));

      setTimeout(function(){
        self.next().find('[type="submit"]').eq(0).trigger('click');
      },200);
    }else{
      self.removeClass('core_parseForm');

      setTimeout(function(){
        self.find('[type="submit"]').eq(0).trigger('click');
      },200);
    }
  }
});


/* ================================================================================================================
 * SUBMIT CART
 */

$(document).on('submit','.core_submitCart',function(e){
  e.preventDefault();

  var self = $(this),
      cart = self.parents('.cart'),
      couponField = $('input[name="code_discount"]'),
      couponValue = '';
      if(couponField) couponValue = couponField.val();

  removeAllErrors(cart.find('.core_storeCartProducts'));

  var errors = {};
  function validateAndSubmitCart(){
    if(cart.length > 0){
      cart.find('.core_parseOption').each(function(){
        var option = $(this),
            product = option.closest('[data-hash]');

        if (product.parent().children().toArray().find(el => $(el).data('parent-hash') === product.data('hash'))) {
          // `product` is a set parent - it has sub products in cart.
          return;
        }

        if(typeof option.data('required') !== 'undefined' && option.data('required') === true){
          if(option.hasClass('select-field-select2')){
            if(option.val() == '' || option.val() === null){
              errors[option.data('key')] = 'required';
            }
          }
        }
      });
    }

    if(Object.keys(errors).length > 0){
      $.each(errors,function(optionId,type){
        var errorContainer = $('.core_parseOption[data-key="' + optionId + '"]').filter( (i, item) => {
              if($(item).val() === null || $(item).val() === '') return $(item)
            }),
            errorContainerElement = errorContainer;

        if(errorContainer.hasClass('select-field-select2')){
          errorContainerElement = errorContainer.next();
        }

        if(type == 'required'){
          addError(errorContainerElement,errorContainer.data('required-error'));
        }
      });

      popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],L['OPT_REQIRED_INFO'],'error');

      return false;
    }else{
      self.removeClass('core_submitCart');
      setTimeout(function(){
        self.find('[type="submit"]').eq(0).trigger('click');
      },200);
    }
  }
  /* if coupon value is set but not confirmed then trigger it before submitting order */
  var isCouponActivated = cookies.read('ac_code')

  if(couponValue && !isCouponActivated){
    if(couponValue.length > 0) $('.core_addDiscountCoupon').trigger('click', true)
  }else{
    validateAndSubmitCart();
  }
});


/* ================================================================================================================
 * STORE CART PRODUCTS
 */
function buildCartProductsOrder(cartRendered, newProductsResponse) {
  $(document).find('.core_storeCartProducts').each(function () {
    var self = $(this);
    var data = {
      serialize: self.find('tbody').find('tr[data-hash]'),
      isCart: self.parents('section.cart').length > 0 ? true : false,
      isOrder: self.parents('section.order').length > 0 ? true : false
    };

    data.serialize.each(function () {
      var product = $(this),
          options = {};

      /* Store data form cart */
      if (data.isCart) {
        if (Object.keys(SkyShop.cart.products).length == 0) {
          SkyShop.cart.products = self.data('products');
        } else {
          product.find('.core_parseOption').each(function () {
            var option = $(this);

            if (typeof option.data('required') !== 'undefined' && option.data('required') === true) {
              options[option.data('key')] = option.val();
            } else if ((option.data('required') === 'undefined' || option.data('required') === false) && option.val() != '') {
              options[option.data('key')] = option.val();
            } else if (option.find('input:checked').length > 0) {
              options[option.data('key')] = option.val();
            }
          });

          SkyShop.cart.products[product.data('hash')] = {
            id: product.data('id'),
            amount: product.find('input[name*="amount_"]').val(),
            options: options
          }

          if(cartRendered === true){

            for (const key in SkyShop.cart.products){
              delete SkyShop.cart.products[key]
            }

            for(const key in SkyShop.card.stocks.storable){
              delete SkyShop.card.stocks.storable[key]
            }

            Object.keys(newProductsResponse.products).map((product, i) => {
              SkyShop.cart.products[product] = {
                id: newProductsResponse.products[product].id,
                amount : newProductsResponse.products[product].amount,
                options: newProductsOptions(Object.values(newProductsResponse.products[product].options).filter((item, i) => { return item.type === 'choose' || item.type === 'text' ?  item : null})),
                optionsExternalValues: newProductsResponse.products[product].optionsExternalValues,
                prodImgId: newProductsResponse.products[product].prodImgId
              }

            })

          }
        }
      }
    });
  });
}
buildCartProductsOrder()


/* ================================================================================================================
 * BUILD NEW SKYSHOP CART PRODUCT
 */

function newProductsOptions (opt) {
  var newSkyShopCartProducts = {}
  opt.map((item, i) => {
    Object.values(item.values).map((jtem, i) => {
      if( jtem.selected.length > 0 ) {
        return newSkyShopCartProducts[item.id] = jtem.id
      }else if(jtem.textValue){
        return newSkyShopCartProducts = {...newSkyShopCartProducts, [item.id] : jtem.id}
      }
    })
  })
  return newSkyShopCartProducts
}

/* ================================================================================================================
 * STORE CART PRODUCT AMOUNT
 */

$(document).on('click','.core_changeProductPhoto',function(){
  var self = $(this),
      productCard = $('.product-card'),
      image;

  var data = {
    label: self.data('image-id')
  };

  if(productCard.length > 0){
    image = productCard.find('.product-slideshow').find('[data-id="' + data.label + '"]');

    if(image.length > 0){
      SkyShop.product.imgId = data.label;
      image.trigger('click');
    }
  }
});


/* ================================================================================================================
 * STORE CART PRODUCT AMOUNT
 */

$(document).on('change','.core_storeCartProductAmount',function(){
  var self = $(this);

  var data = {
    amount: self.val(),
    hash: self.parents('[data-hash]').data('hash')
  };

  if(data.amount < self.data('min')){
    data.amount = self.data('min');
  }

  if(data.amount != ''){
    SkyShop.cart.products[data.hash].amount = parseFloat(data.amount);

    cartUpdate({
      wait: 300,
      hash: [data.hash]
    });
  }
});


/* ================================================================================================================
 * CHANGE SORT TYPE
 */

$(document).on('change','.core_changeSortType',function(){
  if(document.readyState == 'complete'){
    var self = $(this);

    var data = {
      url: self.find('option:checked').val()
    };

    window.location = data.url;
  }
});


/* ================================================================================================================
 * CHOOSE PARAMETERS MULTI
 */

$(document).on('select2:closing','.core_chooseParametersMulti',function(){
  var self = $(this);

  var data = {
    optionPattern: self.prev().find('.choosed-option-pattern')[0].outerHTML
  };

  self.prev().children('input:not(.choosed-option-pattern)').remove();
  self.find('option:checked').each(function(){
    var option = $(this),
        pattern = data.optionPattern;
    pattern = pattern.replace(/{{:name:}}/g,option.attr('name'));

    pattern = $(pattern);
    pattern.removeAttr('disabled');

    self.prev().append(pattern);
  });
});


/* ================================================================================================================
 * CHOOSE SEARCH PRICE
 */

$(document).on('select2:closing','.core_chooseSearchPrice',function(){
  var self = $(this),
      dropdown = $('.select2-results').find('.select2-results__options');

  var data = {
    results: [
      { name: 'from', value: (dropdown.find('input[name="from"]').val() == '' && dropdown.find('input[name="to"]').val() == '' ? 0 : dropdown.find('input[name="from"]').val()) },
      { name: 'to', value: (dropdown.find('input[name="to"]').val() == '' && dropdown.find('input[name="from"]').val() == '' ? 524288 : dropdown.find('input[name="to"]').val()) }
    ],
    optionPattern: self.prev().find('.choosed-option-pattern')[0].outerHTML
  }

  self.prev().children('input:not(.choosed-option-pattern)').remove();
  data.results.forEach(function(option){
    var pattern = data.optionPattern;
    pattern = pattern.replace(/{{:name:}}/g,option.name);
    pattern = pattern.replace(/{{:value:}}/g,option.value);

    pattern = $(pattern);
    pattern.removeAttr('disabled');

    self.prev().append(pattern);
  });
});


/* ================================================================================================================
 * GET ORDER SHIPMENTS
 */


$(document).on('click change','.core_getOrderShipments',function(e, eData){

  const wdtCheckTriggerElements = ['param-rules-wdt','user-bill-country','param-vat'];
  const currentTargetId = e.currentTarget.id;

  if (wdtCheckTriggerElements.includes(currentTargetId) === false) {
    e.preventDefault();
  }

  eData = eData || {};
  var self = $(this),
      order = $('.order');

  if(e.type == 'click'){
    SkyShop.order.paymentId = order.find('input[name="payment"]:checked').val();
    SkyShop.order.overheadValue = self.find('.pay-overhead').val();

    if(self.next().hasClass('more')){
      self.next().find('input[name="payment"]').prop('checked',true);

      if(self.next().find('input[name="payment"]').val() != ''){
        SkyShop.order.paymentId = self.next().find('input[name="payment"]').val();
      }else{
        SkyShop.order.paymentId = self.next().find('[data-payment-banks]').data('payment-banks');
      }
    }

    cookies.create('ac_payment',SkyShop.order.paymentId,60 * 24 * 60 * 60 * 1000);
  }

  var data = {
    paymentId: SkyShop.order.paymentId,
    country: order.find('select[name="user_country"]').val(),
    shipment: order.data('shipment'),
    coupon: order.find('input[name="code_discount"]').val(),
    products: $.base64Encode(JSON.stringify(SkyShop.cart.products)),
    isValidate: !self.parents('.order-select-table').hasClass('ss-error')
  };
  if(typeof data.paymentId === 'undefined'){
    return;
  }
  if (data.paymentId !== null) {
    //GTAG EVENT 'add_payment_info'
    gtagEvent('add_payment_info', {value: SkyShop.order.calculations.orderPriceTotal, payment_type:self.find('.method-title').text(),  item: SkyShop.cart.products}, );
  }



  if(!data.isValidate){
    removeError(self.parents('.order-select-table'));
  }

  var url = '/order/?json=1&pay_id='
      + encodeURIComponent(data.paymentId)
      + '&c=' + data.country
      + '&sel=' + data.shipment
      + (data.coupon !== undefined ? '&code_discount=' + data.coupon : '')
      + '&wdt=' + (SkyShop.order.wdt ? '1' : '0');

  orderCalculate();
  $('.core_finishOrder').prop('disabled', true).attr('title', L['NOT_SELECTED_DELIVERY_METHOD'])
  //todo: `eData.initial` comes from country select `.trigger('select')` to avoid getting shipments list on page load
  if (!eData.initial) {
    $.ajax({
      type: 'POST',
      url: url,
      data: {
        products: data.products
      },
      dataType: 'json',
      success: function (response) {
        $('.core_finishOrder').prop('disabled', false).attr('title', '')
        SkyShop.order.shipments = response;
        orderRenderDeliveries(response);
      }
    });
  }
});

// SET ORDER SERVER SIDE RENDERED CALCULATIONS
SkyShop.order.initialCalculations = $('.order').data('calc');
if (SkyShop.order.initialCalculations) {
  orderRenderCalculations(JSON.parse(atob(SkyShop.order.initialCalculations)));
}

$(window).on('load',function(){
  $(document).find('.core_getOrderShipments').each(function(){
    var self = $(this);

    var data = {
      paymentId: self.data('payment-id')
    };

    if(cookies.read('ac_payment') != null && cookies.read('ac_payment').split('_')[0] == data.paymentId){
      SkyShop.order.paymentId = cookies.read('ac_payment');

      self.trigger('click');
      self.children('td').eq(0).trigger('click');
    }
  });
});


/* ================================================================================================================
 * GET ORDER SHIPMENTS SPECIAL
 */

$(document).on('keyup paste','.core_quickSearchAjax',function(e){
  if([13,16,17,18,27,32,37,39,38,40].indexOf(e.which) > -1){
    return false;
  }

  var self = $(this),
      results = $('.core_quickSearchAjaxHints');

  var data = {
    search: self.val(),
    productPerPage: self.attr("product-per-page"),
    searchLoading: results.find('.search-loading'),
    searchInformation: results.find('.search-information'),
    searchCount: results.find('.search-count'),
    resultPattern: results.find('.search-result-pattern')[0].outerHTML
  };
  var url = '/search?action=quick_search&json=1';

  if(data.search.length > 2){
    if(typeof SkyShop.core.quickSearchAjax === 'number'){
      clearTimeout(SkyShop.core.quickSearchAjax);
    }

    if(results.hasClass('hidden')){
      results.removeClass('hidden');
    }

    data.searchLoading.removeClass('hidden');
    data.searchInformation.addClass('hidden');
    data.searchCount.addClass('hidden');

    SkyShop.core.quickSearchAjax = setTimeout(function(){
      $.post(url,{
        cat_search: data.search,
        products_per_page: data.productPerPage
      },function(response){
        if(typeof response === 'string') {
          response = JSON.parse(response);
        }

        results.find('tr').not('.search-result-pattern').remove();
        if(response.success == true){
          var searchResults = Object.keys(response.data.list);

          if(searchResults.length > 0){
            searchResults.forEach(function(id){
              var result = response.data.list[id];

              var resultTemplate = data.resultPattern;
              resultTemplate = resultTemplate.replace(/{{:id:}}/g,result.prod_id);
              resultTemplate = resultTemplate.replace(/#{{:url:}}/g,result.prod_url);
              resultTemplate = resultTemplate.replace(/{{:image:}}/g,result.prod_img_src);
              resultTemplate = resultTemplate.replace('src="/view/new/img/transparent.png"', '');
              if (result.prod_name.includes('$&','&amp;', '$&amp;')){
                var stringToEncode = specialCharacterNameToReplace(result.prod_name)
                resultTemplate = resultTemplate.replace(/{{:name:}}/g, stringToEncode);
              }else {
                resultTemplate = resultTemplate.replace(/{{:name:}}/g, result.prod_name);
              }
              resultTemplate = resultTemplate.replace(/{{:is_discount:}}/g,result.prod_oldprice == 0  || result.prod_oldprice <= result.prod_price ? 'hidden' : '');
              resultTemplate = resultTemplate.replace(/{{:price:}}/g,result.prod_oldprice == 0 ? result.prod_price : result.prod_oldprice);
              resultTemplate = resultTemplate.replace(/{{:price_discount:}}/g,result.prod_price);
              resultTemplate = resultTemplate.replace(/data-src/g,'src');

              resultTemplate = $(resultTemplate);
              resultTemplate.removeClass('search-result-pattern hidden');
              results.each(function(){
                var resultTemplateClone = resultTemplate.clone();

                $(this).find('tr').eq(-1).after(resultTemplateClone);
              });
            });

            pricesFormatter(results.find('tr').not('.search-result-pattern'));

            data.searchLoading.addClass('hidden');
            data.searchInformation.addClass('hidden');
            data.searchCount.removeClass('hidden');

            data.searchCount.find('.count').text(response.data.count);
          }else{
            results.find('tr').not('.search-result-pattern').remove();
            data.searchLoading.addClass('hidden');
            data.searchInformation.removeClass('hidden');
            data.searchCount.addClass('hidden');

            data.searchInformation.find('.information').html(L['NO_PRODUCTS_IN_CATEGORY'].replace(/&#34;/g,'"'));
          }
        }else{
          results.find('tr').not('.search-result-pattern').remove();
          data.searchLoading.addClass('hidden');
          data.searchInformation.removeClass('hidden');
          data.searchCount.addClass('hidden');

          data.searchInformation.find('.information').text(L['ERROR_UNEXPECTED_ERROR']);
        }
      });
    },300);
  }else{
    if(typeof SkyShop.core.quickSearchAjax === 'number'){
      clearTimeout(SkyShop.core.quickSearchAjax);
    }

    if(!results.hasClass('hidden')){
      results.addClass('hidden');
    }

    results.find('tr').not('.search-result-pattern').remove();
    data.searchLoading.addClass('hidden');
    data.searchInformation.addClass('hidden');
    data.searchCount.addClass('hidden');
  }
});

$(document).on('blur','.core_quickSearchAjax[data-ajax-blur="true"]',function(e){
  var self = $(this),
      results = $('.core_quickSearchAjaxHints');

  setTimeout(function(){
    if(!results.hasClass('hidden')){
      results.addClass('hidden');
    }
  },100);
});

$(document).on('focus','.core_quickSearchAjax[data-ajax-blur="true"]',function(e){
  var self = $(this),
      results = $('.core_quickSearchAjaxHints');

  var data = {
    search: self.val()
  };

  if(results.hasClass('hidden') && data.search.length > 2){
    results.removeClass('hidden');
  }
});


/* ================================================================================================================
 * GET ORDER SHIPMENTS SPECIAL
 */

$(document).on('click','.core_getOrderShipmentsSpecial', async function(e){
  e.preventDefault();
  var self = $(this);

  var data = {
    more: self.next(),
    key: self.data('key'),
    isSelected: false
  };

  let finishOrderButtons = document.querySelectorAll('.core_finishOrder');
  if (finishOrderButtons) finishOrderButtons.forEach(button => button.setAttribute('disabled', ''));

  if(data.more.hasClass('more')){
    await loadShipmentMethods(data.key, data.more);
    data.more.children('td').html(orderShipments(data.key));

    data.isSelected = cookies.read('ac_methods') != null && data.more.children('td').find('select').find('option[value="' + cookies.read('ac_methods') + '"]').eq(0).length > 0;

    if (data.isSelected) {
      data.more.children('td').find('select.core_orderShipmentSelect').val(cookies.read('ac_methods'));
    }

    data.more.children('td').find('select').select2({
      theme: 'bootstrap',
      width: '100%',
      placeholder: '-- ' + L['SELECT'] + '--',
      language: {
        noResults: function(){
          return L['FIRST_SELECT_CITY'];
        }
      },
      escapeMarkup: function(markup){
        return markup;
      }
    }).on('select2:open',function(){
      $('.select2-results > ul').scrollbar();
    }).on('select2:closing',function(){
      $('.select2-results > ul').scrollbar('destroy');
    });

    if (data.isSelected) {
      data.more.children('td').find('select.core_orderShipmentSelect').trigger('select2:select'); // Wczytanie miasta i ulic. Trigger obu na raz nie zapisze ulicy do ciastka
      data.more.children('td').find('select.core_orderShipmentSelectStreet').trigger('select2:select');
    }
  }

  finishOrderButtons.forEach(button => button.removeAttribute('disabled'));
});

/* ==================================================trigger==============================================================
 * LIMITED ORDER SHIPMENTS
 */
$(document).on('change','.core_orderFormChange',function(e){

})

/* ================================================================================================================
 * SET USER COUNTRY IN ORDER
 */
$('.order select[name="user_country"]')
    .on('change', function (e) {
      SkyShop.order.userCountry = $(this).val();
    })
    .trigger('change', {initial: true});

/* ================================================================================================================
 * SET ORDER SHIPMENTS
 */

$(document).on('click','.core_setOrderShipment',function(e,additionalData){
  e.preventDefault();
  var self = $(this),
      order = $('.order');

  var data = {
    shipmentPrice: parseFloat(self.find('.cost').children('span').data('price')),
    shipmentSelected: self.find('input[name="shipment"]').val(),
    shipmentType: self.data('shipment-type'),
    shipmentTypeManipulateElements: order.find('.core_personalOrderShipment'),
    shipmentRequired: self.find('input[name="shipment"]').data('valid-parent'),
    updateCookie: typeof additionalData !== 'undefined' && typeof additionalData.updateCookie !== 'undefined' ? additionalData.updateCookie : true
  };

  SkyShop.bug.pickDelivery(this);

  if(self.parents('.ss-error').eq(0).length > 0){
    removeError(self.parents('.ss-error').eq(0));
  }

  recalculateErrors();

  if(data.shipmentType == 'personal' && data.shipmentRequired == ''){
    data.shipmentTypeManipulateElements.addClass('hidden');
  }else{
    data.shipmentTypeManipulateElements.removeClass('hidden');
  }
  SkyShop.order.shipmentPrice = data.shipmentPrice;
  SkyShop.order.shipmentSelected = data.shipmentSelected;

  //GTAG EVENT 'add_shipping_info'
  gtagEvent('add_shipping_info', {
    value: SkyShop.order.calculations.orderPriceTotal,
    shipping_tier:self.find('.method-title').text(),
    item: SkyShop.cart.products
  });

  if(data.updateCookie){
    cookies.create('ac_shipment',data.shipmentSelected,60 * 24 * 60 * 60 * 1000);
  }

  orderRenderStarInput(data.shipmentRequired)
  renderLimitedOrderOptions(SkyShop.order.shipments[SkyShop.order.shipmentSelected], data.shipmentRequired )
  orderCalculate();
});


/* ================================================================================================================
 * OPEN ORDER BANK SELECT
 */

$(document).on('click','.core_openOrderBankSelect',function(e){
  e.preventDefault();

  var self = $(this);

  var banksList = null,
      banksCustomClass = [],
      banksListNew = {},
      banksPayment = self.find('[data-payment-banks]'),
      banksPaymentId = banksPayment.data('payment-banks');

  switch(banksPaymentId){
    case 3: // PayU
    case 13: // PayU.cz
      PlnPayTypeArray.forEach(function(channel){
        banksListNew[channel['type']] = {
          img: channel['img'],
          name: channel['name']
        }
      });

      banksList = banksListNew;
      break;
    case 9: // Tpay
      tr_channels.forEach(function(channel){
        banksListNew[channel[0]] = {
          img: channel[3],
          name: channel[1]
        }
      });

      banksList = banksListNew;
      break;
    case 10: // Dotpay
      banksList = JSON.parse(Payment[10]).available_channels;

      Object.keys(banksList).forEach(function(channel){
        banksListNew[channel] = {
          img: banksList[channel].logo_file,
          name: banksList[channel].name
        }
      });

      banksList = banksListNew;
      break;
    case 11: // Przelewy24
      banksList = JSON.parse(Payment[11]).available_channels;
      break;
    case 15: // SkyPay
      banksList = JSON.parse(Payment[15]).available_channels;

      Object.keys(banksList).forEach(function(channel){
        banksListNew[channel] = {
          img: banksList[channel].logo_file,
          name: banksList[channel].name
        }
      });

      banksList = banksListNew;

      banksCustomClass = ['banks-skypay'];
      break;
  }

  var data = {
    banksList: banksList,
    banksClass: ['common-banks-list','container-fluid'].concat(banksCustomClass).join(' '),
    bankPattern: self.next()[0].outerHTML,
    banksListHtml: '',
    bankLogos: {
      loaded: 0,
      total: Object.keys(banksList).length
    }
  };

  var showBanksPopup = function(){
    Object.keys(data.banksList).forEach(function(key){
      var bank = data.banksList[key],
          bankElement = data.bankPattern,
          banksListPopup = $(document).find('.swal2-container').find('.row');

      bankElement = bankElement.replace(/{{:id:}}/g,key);
      bankElement = bankElement.replace(/{{:name:}}/g,bank['name']);
      bankElement = bankElement.replace(/{{:logo:}}/g,bank['img']);
      bankElement = bankElement.replace(/data-src/g,'src');
      bankElement = bankElement.replace(/bank-pattern/g,'');
      bankElement = bankElement.replace(/hidden/g,'');

      data.banksListHtml += bankElement;

      banksListPopup.html(data.banksListHtml);
    });
  };

  swal({
    width: 1000,
    confirmButtonText: '',
    confirmButtonClass: 'btn btn-hidden',
    title: L['SELECT_BANK'],
    html: '<div class="' + data.banksClass + '"><div class="row"><i class="fa fa-refresh fa-spin fa-3x fa-fw"></i></div></div>'
  });

  Object.keys(data.banksList).forEach(function(key){
    var bank = data.banksList[key],
        bankLogo = new Image();

    bankLogo.onload = function(){
      data.bankLogos.loaded++;

      if(data.bankLogos.loaded == data.bankLogos.total){
        showBanksPopup();
      }
    };
    bankLogo.onerror = function(e){
      data.bankLogos.loaded++;

      data.banksList[key]['img'] = '/view/new/img/ico/bank.png';

      if(data.bankLogos.loaded == data.bankLogos.total){
        showBanksPopup();
      }
    };
    bankLogo.src = bank['img'];
  });
});


/* ================================================================================================================
 * ORDER SHIPMENT SELECT
 */

$(document).on('select2:select','.core_orderShipmentSelect',function(e,additionalData){
  e.preventDefault();

  var self = $(this);

  var data = {
    key: self.data('key'),
    type: self.data('type'),
    city: self.val(),
    streetsRendered: typeof additionalData !== 'undefined' && typeof additionalData.streetsRendered !== 'undefined' ? true : false
  };

  cookies.create('ac_methods',data.city,60 * 24 * 60 * 60 * 1000);
  orderShipmentsStreets(data.key,data.type,data.city,function(){
    if(data.streetsRendered){
      additionalData.streetsRendered();
    }
  });
});


/* ================================================================================================================
 * ORDER SHIPMENT SELECT STREET
 */

$(document).on('select2:select','.core_orderShipmentSelectStreet',function(e){
  e.preventDefault();

  var self = $(this),
      more = self.parents('tr.more').eq(0);

  if(!self.parent().hasClass('hidden')) {
    var data = {
      key: self.data('streets'),
      value: self.val()
    };
    more.find('input[name*="shipment_method"]').val(data.value);
    cookies.create('ac_ship' + data.key + '_method', data.value, 60 * 24 * 60 * 60 * 1000);
  }
});


/* ================================================================================================================
 * PARMS TO DEBUG
 */

SkyShop.bug = {
  parse: {
    street: {},
    shipment: {},
    SelectStreet: {error: 'null'},
    SelectShipment: {error: 'null'},
    delivery: {error: 'null'},
    counter: 0
  },
  add: function () {
    var handler = '#order-deliverys-methods .more.open .hidden';

    if ( $(handler + ' .order_bug').length == 0 ) {
      $(handler).append('<input type="hidden" class="order_bug" name="order_bugs" value=\''+JSON.stringify(SkyShop.bug.parse)+'\'>');
    } else {
      $(handler + ' .order_bug').val(JSON.stringify(SkyShop.bug.parse));
    }
  },
  pickDelivery: function (item) {
    var h = $(item);
    var selects = {}
    var more = $('#order-deliverys-methods .more.open');

    if (h.hasClass('core_getOrderShipmentsSpecial') && more.length > 0) {

      if ( more.find('.core_orderShipmentSelect').length > 0 ) {
        selects.realShipment = more.find('.core_orderShipmentSelect').val();
      } else {
        selects.realShipment = false;
      }

      if ( more.find('.core_orderShipmentSelectStreet').length > 0 ) {
        selects.realStreet = more.find('.core_orderShipmentSelectStreet').val();
      } else {
        selects.realStreet = false;
      }

      if ( more.find('.core_orderShipmentSelectStreet + span .select2-selection__rendered').length > 0 ) {
        selects.fakeStreet = more.find('.core_orderShipmentSelectStreet + span .select2-selection__rendered').text();
      } else {
        selects.fakeStreet = false;
      }

      if ( more.find('.core_orderShipmentSelect + span .select2-selection__rendered').length > 0 ) {
        selects.fakeShipment = more.find('.core_orderShipmentSelect + span .select2-selection__rendered').text();
      } else {
        selects.fakeShipment = false;
      }

    } else {
      SkyShop.bug.parse.delivery.error = 'no special options';
    }

    SkyShop.bug.parse.delivery = {
      key: h.attr('data-key'),
      title: h.find('.method-title').text(),
      cost: h.find('.core_priceFormat').attr('data-price'),
      select: selects,
      counter: ++SkyShop.bug.parse.counter
    }
    SkyShop.bug.add();
  }
}


$(document).on('select2:select', function (e) {
  var h = $(e.target);
  var tmp;
  var street = '#order-deliverys-methods .core_orderShipmentSelectStreet';
  var fake = ' + span .select2-selection__rendered';

  if ( h.hasClass('core_orderShipmentSelectStreet') ) {
    if (e.params && e.params.data) {
      tmp = e.params.data;
      SkyShop.bug.parse.street = {
        id: tmp.id,
        text: tmp.text,
        selected: tmp.selected,
        error: '',
        counter: ++SkyShop.bug.parse.counter
      }
    } else {
      SkyShop.bug.parse.street.error = 'not changed';
    }
  } else if ( h.hasClass('core_orderShipmentSelect') ) {
    if (e.params && e.params.data) {
      tmp = e.params.data;
      SkyShop.bug.parse.shipment = {
        id: tmp.id,
        text: tmp.text,
        selected: tmp.selected,
        error: '',
        counter: ++SkyShop.bug.parse.counter
      }

      if ( $(street).length > 0 ) {
        SkyShop.bug.parse.SelectStreet = {
          error: '',
          streets: $(street).attr('data-streets'),
          selected: $(street).val(),
          counter: SkyShop.bug.parse.counter
        }
      }

      if ( $(street + fake).length > 0 ) {
        SkyShop.bug.parse.street = {
          error: 'shipment event',
          text: $(street + fake).text(),
          counter: SkyShop.bug.parse.counter
        }
      }

    } else {
      SkyShop.bug.parse.shipment.error = 'not changed';
    }
  } else {
    SkyShop.bug.parse.error = 'fake select wasnt picked';
  }

  SkyShop.bug.add();
});

$(document).on('change', '.core_orderShipmentSelect', function (e) {
  var hStreet = '#order-deliverys-methods .core_orderShipmentSelectStreet';
  SkyShop.bug.parse.SelectShipment = {
    key: $(this).attr('data-key'),
    type: $(this).attr('data-type'),
    selected: $(this).val(),
    error: '',
    counter: SkyShop.bug.parse.counter + 0.5
  }

  if ( $(hStreet).length > 0 ) {
    SkyShop.bug.parse.SelectStreet = {
      error: '',
      streets: $(hStreet).attr('data-streets'),
      selected: $(hStreet).val(),
      counter: SkyShop.bug.parse.counter + 0.5
    }
  } else {
    SkyShop.bug.parse.SelectStreet = {
      error: 'real select not found'
    }
  }

  SkyShop.bug.add();
});

$(document).on('change', '.core_orderShipmentSelectStreet', function (e) {
  SkyShop.bug.parse.SelectStreet = {
    streets: $(this).attr('data-streets'),
    selected: $(this).val(),
    error: '',
    counter: SkyShop.bug.parse.counter + 0.6
  }
  SkyShop.bug.add();
})

/* ================================================================================================================
 * ORDER OPEN MAP DPD
 */
var onSelectedPoint = function (pointId) {
  let self = $(this),
      order = $('.order'),
      orderDeliveries = order.find('#order-deliverys-methods'),
      orderDeliveriesOpen = orderDeliveries.find('.more.open'),
      orderDeliveriesCity = orderDeliveriesOpen.find('.core_orderShipmentSelect'),
      orderDeliveriesStreet = orderDeliveriesOpen.find('.core_orderShipmentSelectStreet');

  $.ajax({
    method: 'GET',
    url: `/order/?json=1&action=getPickupPoint&function=dpd_pickup&pointId=${pointId}`,
    beforeSend:  () => {
      showHideStreetSelect('hide')
    }
  }).done(function (data) {
    if(data !== undefined && data !== null ) {
      orderDeliveriesCity.val(data.city).trigger('select2:select').trigger('change');
      SkyShop.order.shipmentStreetPickedFromMap = data.id
      swal.close();
    }else{
      swal({
        width: 1000,
        confirmButtonText: 'OK',
        confirmButtonClass: 'btn',
        title: L['ERROR_UNEXPECTED_ERROR'],
        html: '<div><div class="row" style="padding: 40px;">' + L['ERROR_CRITICAL_MESSAGE'] + '</div></div>'
      })
    }
  })

}

$(document).on('click', '.core_orderOpenMapDpdPickup', function(e) {
  e.preventDefault();

  var dpdIframe =  function () {
    var dpdContainer =  $('.swal-dpd-pickup-popup').find('#dpd-map'),
        dpdMapWidget = `
        <script id="dpd-widget" type="text/javascript">
            function pointSelected(pointID){
                onSelectedPoint(pointID);
            }
        </script>
        <script type="text/javascript" 
            src="https://pudofinder.dpd.com.pl/source/dpd_widget.js?key=${SkyShop.dpdMapKey}">
        </script>
        `
    dpdContainer.append(dpdMapWidget)
  };

  toggleClassSwalScroll()

  swal({
    width: 920,
    confirmButtonText: '',
    confirmButtonClass: 'close-shape',
    cancelButtonText: '',
    cancelButtonClass: 'hidden',
    title: L['DPD_PICKUP_POINT_MAP'],
    html: '<div id="dpd-map"></div>',
    customClass: 'swal-dpd-pickup-popup',
    allowOutsideClick: false,
    allowEscapeKey: false,
    onOpen:  function() {
      dpdIframe()
    }
  }).then(function(){});

  $('.swal2-container').on('click', function(event) {
    if (event.target !== event.currentTarget) {
      return;
    }
    toggleClassSwalScroll();
    swal.close();
  });

});

/* ================================================================================================================
 * ORDER OPEN MAP GLS
 */
$(document).on('click', '.core_orderOpenMapGls', function(e) {
  e.preventDefault();

  var onSelectedGlsPoint = function (selectedPoint) {
    let self = $(this),
        order = $('.order'),
        orderDeliveries = order.find('#order-deliverys-methods'),
        orderDeliveriesOpen = orderDeliveries.find('.more.open'),
        orderDeliveriesCity = orderDeliveriesOpen.find('.core_orderShipmentSelect');
        // orderDeliveriesStreet = orderDeliveriesOpen.find('.core_orderShipmentSelectStreet');

    orderDeliveriesCity.val(selectedPoint.selected.city).trigger('select2:select').trigger('change');
    SkyShop.order.shipmentStreetPickedFromMap = selectedPoint.selected.id
    swal.close();
  }
  
  
  toggleClassSwalScroll()

  swal({
    width: 920,
    confirmButtonText: '',
    confirmButtonClass: 'close-shape',
    cancelButtonText: '',
    cancelButtonClass: 'hidden',
    title: L['GLS_PICKUP_POINT_MAP'],
    html: '<div id="gls_map" class="szybkapaczka_map" style="width:890px;height:600px"></div>',
    customClass: 'swal-gls-pickup-popup',
    allowOutsideClick: false,
    allowEscapeKey: false,
    onOpen:  function() {
      SzybkaPaczkaMap.init({
        lang: window.S.LANG.toUpperCase() !== "PL" ?  "EN" : "PL",
        country_parcelshops: $('.user_country ').val(),
        parcel_weight:'5',
        el: 'gls_map'
      })
    }
  }).then(function(){});

  $('.swal2-container').on('click', function(event) {
    if (event.target !== event.currentTarget) {
      return;
    }
    toggleClassSwalScroll();
    swal.close();
  });

  window.addEventListener('get_parcel_shop',function(e){
    onSelectedGlsPoint(e.target.ParcelShop)
  })
})

/* ================================================================================================================
 * ORDER OPEN MAP PACZKOMATY
 */

const toggleClassSwalScroll = () => {
  $('html').toggleClass('no-touch prevent-scroll');
  $('html').toggleClass('prevent-scroll-desktop'); 
};

$(document).on('click', '.core_orderOpenMapPaczkomaty', function(e) {
  e.preventDefault();

    var self = $(this),
      order = $('.order');

    window.easyPackAsyncInit = function() {
      easyPack.init({
        /**
         * Ciekawostka
         * W pliku mapa.min.js można podmienić url
         * do biblioteki która się zaciąga przy uruchomieniu mapy
         * i powoduje nadpisanie zmiennej L
         * link do biblioteki jest pod kluczem "leafletMapApi"
         * oryginalna wartość to:
         * https://unpkg.com/leaflet@1.4.0/dist/leaflet.js
         * można podmienić na adres sklepu np. do spreparowanego pliku:
         * /inc/shipments/paczkomaty/map/leaflet.js
         * Tutaj przy init podmiana tego klucza nic nie daje
         */
        points: {
          types: ['parcel_locker']
        },
        map: {
          clusterer: {
            zoomOnClick: true,
            gridSize: 140,
            maxZoom: 16,
            minimumClusterSize: 10
          },
          useGeolocation: true,
          initialZoom: 13,
          defaultLocation: [52.236552, 21.022596],
          initialTypes: ['parcel_locker']
        }
      });

      var map = easyPack.mapWidget('easypack-map',  function(point) {

        toggleClassSwalScroll();
        swal.close();

        var orderDeliveries = order.find('#order-deliverys-methods'),
          orderDeliveriesOpen = orderDeliveries.find('.more.open'),
          orderDeliveriesCity = orderDeliveriesOpen.find('.core_orderShipmentSelect');
          // orderDeliveriesStreet = orderDeliveriesOpen.find('.core_orderShipmentSelectStreet');

         orderDeliveriesCity.val(point.address_details.city).trigger('select2:select').trigger('change');
          SkyShop.order.shipmentStreetPickedFromMap = point.name

        // orderDeliveriesStreet.val(point.name).trigger('select2:select').trigger('change');
      });
      
      function geolocationSuccess(position) {
        const zoom = 14;
        const latitude  = position.coords.latitude;
        const longitude = position.coords.longitude;

        map.mapController.setCenterFromArray([latitude, longitude]);
        map.mapController.setZoom(zoom);
      }

      function geolocationError() {
        console.log('Geolocation Error');
      }

      function setPositionByGeolocation() { 
        if (navigator.geolocation) {
          setTimeout(function() {
            navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
          }, 1000);
        }
      }    

      setPositionByGeolocation();
    };

    swal({
      width: 920,
      confirmButtonText: '',
      confirmButtonClass: 'close-shape',
      cancelButtonText: '',
      cancelButtonClass: 'hidden',
      title: L['FIND_SELECT_PARCEL_LOCER'],
      html: '<div id="easypack-map"></div><i class="close-shape"></i>',
      customClass: 'swal-shop-paczkomaty-popup',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(function(){}, function(){});

    $('.swal-shop-paczkomaty-popup').on('click', '.close-shape', function() {
      toggleClassSwalScroll();
      swal.close();
    });

    $('.swal2-container').on('click', function(event) {
      if (event.target !== event.currentTarget) {
        return;
      }

      toggleClassSwalScroll();
      swal.close();
    });

    if (window.easyPackUserConfig) {
      easyPack.asyncInit();
    }
});

/* ================================================================================================================
 * ORDER OPEN MAP DHL POP
 */
$(document).on('click', '.core_orderOpenMapDhlPop', function(e) {
  e.preventDefault();
  
    var self = $(this),
      order = $('.order'),
      orderDeliveries = order.find('#order-deliverys-methods'),
      orderDeliveriesOpen = orderDeliveries.find('.more.open'),
      orderDeliveriesCity = orderDeliveriesOpen.find('.core_orderShipmentSelect'),
      orderDeliveriesStreet = orderDeliveriesOpen.find('.core_orderShipmentSelectStreet');

    function listenMessage(msg) {
      if (jQuery.type(msg.data) == 'object') {
        var point = msg.data;
      } else {
        var point = JSON.parse(msg.data);
      }

      orderDeliveriesCity.val(point.city.toUpperCase()).trigger('select2:select').trigger('change');
      SkyShop.order.shipmentStreetPickedFromMap = point.sap
      // orderDeliveriesStreet.val(point.sap).trigger('select2:select').trigger('change');

      toggleClassSwalScroll();
      swal.close();
    }

    if (window.addEventListener) {
      window.addEventListener('message', listenMessage, false);
    } else {
      window.attachEvent('onmessage', listenMessage);
    }

    var data = getShipmentsData(
        $(document.getElementsByClassName('core_getOrderShipmentsSpecial active')).data('key')
    );
    var map = getDhlMapByPointType(data.sh_points_type || null);
    swal({
      width: 920,
      showConfirmButton: false,
      showCloseButton: false,
      title: L['FIND_SELECT_POINT'],
      html: '<div id="dhl-map"></div><i class="close-shape"></i><iframe id="dhl-pop-iframe" src="'+ map +'"  style="width: 100%; border: 0px; min-height: 600px;"></iframe>',
      customClass: 'swal-shop-dhl-pop-popup',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(function(){}, function(){});

    $('.swal-shop-dhl-pop-popup').on('click', '.close-shape', function() {
      toggleClassSwalScroll();
      swal.close();
    });
    
    $('.swal2-container').on('click', function(event) {
      if (event.target !== event.currentTarget) {
        return;
      }

      toggleClassSwalScroll();
      swal.close();
    });
});

/* ================================================================================================================
 * ORDER BANK SELECT
 */

$(document).on('click','.core_orderBankSelect',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {
    closeModal: self.parents('.swal2-modal').find('.swal2-confirm'),
    paymentId: self.data('payment'),
    bankId: self.data('id'),
    name: self.data('name'),
    logo: self.data('logo')
  };

  SkyShop.order.paymentId = data.paymentId + '_' + data.bankId + '_' + data.name;
  cookies.create('ac_payment',SkyShop.order.paymentId,60 * 24 * 60 * 60 * 1000);

  var paymentContainer = $('.order').find('[data-payment-selected="' + data.paymentId + '"]');
  paymentContainer.parent().addClass('selected');
  paymentContainer.parent().find('input[name="payment"]').val(SkyShop.order.paymentId).prop('checked',true);
  paymentContainer.find('.fa').addClass('hidden');
  paymentContainer.find('img').removeAttr('data-src').attr('src',data.logo);
  paymentContainer.find('.bank-name').text(data.name);

  if(paymentContainer.parents('.ss-error').eq(0).length > 0){
    removeError(paymentContainer.parents('.ss-error').eq(0));
  }

  data.closeModal.trigger('click');
});


/* ================================================================================================================
 * COPY DATA TO INVOICE
 */

$(document).on('click','.core_copyDataToInvoice',function(e){
  e.preventDefault();

  var self = $(this),
      order = $('.order');

  var data = {
    values: {
      country: order.find('[name="user_country"]').val(),
      companyName: (order.find('[name="user_company"]').val() === '') ?
          order.find('[name="user_firstname"]').val() + ' ' + order.find('[name="user_lastname"]').val() :
          order.find('[name="user_company"]').val(),
      city: order.find('[name="user_city"]').val(),
      postCode: order.find('[name="user_code"]').val(),
      street: order.find('[name="user_street"]').val(),
      tin: order.find('[name="user_receipt_vat"]').val()
    },
    updateForm: {
      country: order.find('[name="user_bill_country"]'),
      companyName: order.find('[name="user_bill_company"]'),
      city: order.find('[name="user_bill_city"]'),
      postCode: order.find('[name="user_bill_code"]'),
      street: order.find('[name="user_bill_street"]'),
      tin: order.find('[name="user_bill_vat"]:not(:disabled)'),

    }
  };

  Object.keys(data.updateForm).forEach(function(key){
    var element = data.updateForm[key];

    if(typeof data.values[key] !== 'undefined' && data.values[key] != ''){
      element.val(data.values[key]);
    }
  });

  order.find('.order-country').select2('destroy').select2({
    theme: 'bootstrap',
    width: '100%'
  });

  checkWdtShowCheckbox();
});


/* ================================================================================================================
 * ORDER FORM CHANGE
 */

$(document).on('change','.core_orderFormChange',function(e){
  var self = $(this),
      input = $(e.target),
      inputContainer = false,
      selfTest = false;

  if(input.hasClass('ss-error')){
    inputContainer = input;
    selfTest = true;
  }
  if(input.parents('.ss-error').eq(0).length > 0){
    inputContainer = input.parents('.ss-error').eq(0);
  }
  if(input.nextAll('.ss-error').eq(0).length > 0){
    inputContainer = input.nextAll('.ss-error').eq(0);
  }

  if(!inputContainer){
    return false;
  }

  if(inputContainer.hasClass('ss-error')){
    if(formValidator(inputContainer,selfTest)){
      removeError(inputContainer);
    }
  }

});


/* ================================================================================================================
 * CARD PARAMS CHANGE
 */

$(document).on('change keyup','.core_cardParamsChange',function(e){
  var self = $(this),
      input = $(e.target),
      inputContainer,
      card = self.parents('.product-card');
  if(!input.hasClass('core_cardParamsChange')){
    if(input.parent().hasClass('checkbox-field')){
      inputContainer = input.parents('.choose-field').eq(0);
    }
    if(input.hasClass('select-field-select2')){
      inputContainer = input.nextAll('.select-field-select2-container').eq(0);
    }
    if(input.hasClass('text-parameter-box')){
      inputContainer = input
    }
    if(inputContainer.hasClass('ss-error')){
      removeError(inputContainer);
    }
    if(inputContainer.parent().find('.ss-error-container').length) {
      inputContainer.parent().find('.ss-error-container').each(function(){
        $(this).css({display: 'none'})
      })
    }
    
  }

  var data = {
    additionals: self.find('input:checked[data-additional-price],option:selected[data-additional-price], span[data-additionals-valid="true"][data-additional-price]'),
    additionalsSum: 0,
    additionalsSumNoDiscount: 0,
    cardPriceSpecial: card.find('.core_cardPriceSpecial'),
    cardPriceDiscountPercent: card.find('.core_cardPriceDiscountPercent'),
    cardPriceDiscount: card.find('.core_cardPriceDiscount'),
    cardPriceBeforeDiscount: card.find('.core_cardPriceBeforeDiscount'),
    noPrice: $('body').attr('data-hurt-price-text'),
    singleParamsArray: ['ean', 'barcode', 'symbol'],
    defaultSingleParams: {
      ean: $(document).find('[data-parameter-value="ean"]').data('parameterDefaultValue'),
      barcode: $(document).find('[data-parameter-value="barcode"]').data('parameterDefaultValue'),
      symbol: $(document).find('[data-parameter-value="symbol"]').data('parameterDefaultValue')
    },
    manageParameterRowVisibility: () => {
      let productParametersRow = document.querySelector('.product-parameters-row');
      let productParameters = document.querySelector('.product-parameters-row .product-parameters')
      var paramElementsAmount = $(productParameters).find('tr').length,
          paramHiddenElementsAmount = $(productParameters).find('tr.hidden').length;
      /* if all parameters are hidden hide row */
      paramElementsAmount === paramHiddenElementsAmount ? productParametersRow.classList.add('hidden') : productParametersRow.classList.remove('hidden')
    },
    getFormData: () => {
      let arr = []
      let selectInputs = self.find($('select'))

      selectInputs.each((index) => {
        let val = selectInputs[index].value;
        const name = selectInputs[index].getAttribute('data-key');

        if(val.length >= 1) arr.push({ name, value: val })
      })

      if(arr.length >= 1){
        return arr.concat(self.serializeArray())
      }else{
        return self.serializeArray()
      }
    },
    prodId: self.closest('.product-informations').attr('data-id'),
    prodPriceFactorSelector: card.find('[data-unit-price-factor]'),
    prodPriceFactorCoeff: card.find('[data-unit-price-factor]').data('unit-price-factor')
  };

  data.additionals.each(function(){
    var param = $(this),
        additionalPrice = param.data('additional-price'),
        additionalPriceNoDiscount = param.data('additional-price-no-discount');

    data.additionalsSum = Big(data.additionalsSum).plus(additionalPrice);
    if(data.cardPriceBeforeDiscount.length > 0){
      data.additionalsSumNoDiscount = Big(data.additionalsSumNoDiscount).plus(additionalPriceNoDiscount);
    }
  });

  data.additionalsSum = Big(
      data.cardPriceSpecial.data('price-default') != data.noPrice ? data.cardPriceSpecial.data('price-default') : 0
  ).plus(data.additionalsSum);
  if(data.cardPriceBeforeDiscount.length > 0){
    data.additionalsSumNoDiscount = Big(
        data.cardPriceBeforeDiscount.data('price-default') != data.noPrice ? data.cardPriceBeforeDiscount.data('price-default') : 0
    ).plus(data.additionalsSumNoDiscount);
  }

  data.cardPriceSpecial.data('price',data.additionalsSum);

  if( !!data.prodPriceFactorCoeff && !!data.prodPriceFactorSelector.length){
       data.prodPriceFactorSelector.data('price',(data.additionalsSum/data.prodPriceFactorCoeff));
  }

  data.cardPriceBeforeDiscount.data('price',data.additionalsSumNoDiscount);
  pricesFormatter(card);

  function manageParameterVisibility(element, params){
    params ? element.classList.remove('hidden') : element.classList.add('hidden')
  }

  function setSingleParams(array, params){
    /* IF PARAMS ARE NOT PASSED THEN USE DEFAULT ONES */

    let productParams = {};
    params ? productParams = params : productParams = data.defaultSingleParams;
    /* MANAGE EVERY PARAMETER FROM ARRAY */
    array.map(el => {
      const currentElement = document.querySelector('[data-parameter-value="' + el + '"]')
      const displayElement = currentElement.querySelector('[data-display-selector]')
      if(currentElement.dataset.parameterDisplay > 0){
        let defaultValue = currentElement.dataset.parameterDefaultValue
        let selectedOptionsArray = data.getFormData();
        selectedOptionsArray.length >= 1 ? displayElement.innerHTML = productParams[el] : displayElement.innerHTML = defaultValue
        manageParameterVisibility(currentElement, productParams[el])
      }
    });
  }
  function setAvailabilityParams(params){
    const selectors = {
      text: document.querySelector('[data-parameter-value="availability_amount_text"]'),
      img: document.querySelector('[data-parameter-value="availability_img"]'),
      number: document.querySelector('[data-parameter-value="availability_amount_number"]'),
      unit: document.querySelector('[data-parameter-value="availability_unit"'),
    }
    const defaultValues = {
      text: selectors.text ? selectors.text.dataset.parameterDefaultValue : '',
      img: selectors.img ? selectors.img.dataset.parameterDefaultValue : '',
      number: selectors.number ? selectors.number.dataset.parameterDefaultValue : ''
    }
    const selectedOptionsArray = data.getFormData();
    const { text, number, unit, img } = selectors
    if(selectedOptionsArray.length >= 1) { /* if user clicked at least one parameter */
      if(typeof params === 'object'){ /* if is object it means it's text value and can contain image */
        if(text) text.innerHTML = params.name
        if(params.img){
          if(img) img.classList.remove('hidden')
          if(img) img.setAttribute('src', params.img)
        }else{
          if(img) img.removeAttribute('src')
          if(img) img.classList.add('hidden')
        }
      }else{ /* else it's number value*/
        if(number) number.innerHTML = params
      }
    }else{ /* else get default values back */
      if(defaultValues.text){ /* VISIBILITY: if values are text type */
        if(text) text.classList.remove('hidden')
        if(number) number.classList.add('hidden')
        if(unit) unit.classList.add('hidden')
      }else{ /* VISIBILITY: if values are number type */
        if(text) text.classList.add('hidden')
        if(img) img.classList.add('hidden')
        if(number) number.classList.remove('hidden')
        if(unit) unit.classList.remove('hidden')
      }
      /* set values */
      if(text) text.innerHTML = defaultValues.text
      if(img) img.innerHTML = defaultValues.img
      if(number) number.innerHTML = defaultValues.number
    }
  }

  const setMaxAmount = amount => {
    const input = document.querySelector('.core_counterValue');

    if(input !== null) {
      if ($(input).data('productamountstatus') === 'hide' || $(input).data('productamountstatus') === 'deny') {
        input.setAttribute('data-max', amount);
        $(input).data('max', amount);
        if (amount < input.value) $(input).val(amount)
        else if (amount > input.value) {
          const button = $(document.querySelector('.counter-increase.core_counterValueChange')).attr('disabled', !1)
          $(input).val(input.value)
        } else $(input).val(input.value)
      }else {
        input.setAttribute('data-max', 524288);
        $(input).data('max', 524288);
        $(input).val(input.value)
      }
    }
  }


  // Update stocks
  function updateStocks(res){
    let newParams = res.data;
    setMaxAmount(newParams.availabilityNumber)
    setSingleParams(data.singleParamsArray, newParams);
    setAvailabilityParams(newParams.availability);
    /* IF THERE IS NO PARAMETES THEN HIDE ROW (avoid showing border) */
    data.manageParameterRowVisibility();
  }
  // Sending a request for warehouse stocks managment
  function getParticularStocks(id, params){
    return $.ajax({
      method: 'POST',
      url: '?json=1&action=getStockValuesByParams',
      data: {
        data: JSON.stringify({
          id: id,
          options: params
        })
      },
      dataType: 'json',
      success: function(data){
        updateStocks(data)
      }
    })
  }
  /* IF IS RENDERED FIRST TIME, THEN AVOID SENDING UNNECESSARY REQUEST */
  if(window.SkyShop.card.allowStockRequest){
    let selectedOptionsArray = data.getFormData();
    let sortedOptions = [];

    if (selectedOptionsArray.length > 0) {
      sortedOptions = selectedOptionsArray.reduce((acc, item) => {
        const productId = item.name.split('-').pop();
        const prevValue = acc ? acc[productId] : acc;
        let nextValue;

        if (prevValue) {
          nextValue = Array.isArray(prevValue) ? [...prevValue, item.value] : [prevValue, item.value]
        } else {
          nextValue = [item.value]
        }

        return {...acc, [productId]: nextValue}
      }, undefined)
    }

    getParticularStocks(data.prodId, sortedOptions);
  }else{
    window.SkyShop.card.allowStockRequest = true;
    setSingleParams(data.singleParamsArray);
    /* IF THERE IS NO PARAMETES THEN HIDE ROW (avoid showing border) */
    data.manageParameterRowVisibility();
  }
});


/* ================================================================================================================
 * CARD STOCKS MANAGE
 */

const disableParams = (params, self) => {

  Object.keys(params).forEach(id => {
    Object.values(params[id]).forEach(value => {
      const field = self.find('[data-key="' + value.group_id + '"]');

      if (value.count == 0) {

        if (field.hasClass('select-field-select2')) {
          field.find('option[value="' + value.option_id + '"]').attr('disabled', 'disabled');
        } else {
          field.find('input[value="' + value.option_id + '"]').parent().addClass('disable');
        }
      } else {
        if (field.hasClass('select-field-select2') && field.find('option[selected="selected"]').length > 0) {
          field.find('option:not([selected="selected"])').each((index, option) => {
            $(option).attr('disabled','disabled')
          });
        }
      }
    });
  });
}

$(document).on('stockManage','.core_cardStocksManage',function(e,parameters){
  var product = $(this);

  product.each(function(){
    var self = $(this);

    if(typeof self.data('stocks') === 'undefined'){
      return;
    }

    var data = {
      isCart: self.parents('section.cart').length > 0 ? true : false,
      maxAmount: 0,
      stocks: null,
      hash: null,
      id: null
    };

    if(data.isCart){
      data.hash = product.parents('[data-hash]').eq(0).data('hash');
      data.id = product.parents('[data-id]').eq(0).data('id');
    }else{
      data.hash = product.parents('[data-id]').eq(0).data('id');
      data.id = product.parents('[data-id]').eq(0).data('id');
    }

    if(typeof SkyShop.card.stocks.storable[data.hash] === 'undefined'){
      SkyShop.card.stocks.storable[data.hash] = JSON.parse(JSON.stringify(SkyShop.card.stocks.pattern));
    }

    data.stocks = SkyShop.card.stocks.storable[data.hash].stocks;

    var countParams = {},
        emptyStocks = [];

    if(data.stocks == null){

      data.stocks = SkyShop.card.stocks.storable[data.hash].stocks = (data.isCart && 'stocks' in self.data('stocks')) ? { [data.id]: self.data('stocks') } : self.data('stocks');

      Object.entries(data.stocks).forEach(([productId,stocks]) => {
        countParams[productId] = {}
        stocks.stocks.forEach(stock => {
          stock.items.forEach(item => {
            if (typeof countParams[productId][item.option_id] === 'undefined') {
              countParams[productId][item.option_id] = {
                group_id: `${item.group_id}-${productId}`,
                option_id: item.option_id,
                count: 0
              };
            }

            if (stock.amount > 0) {
              countParams[productId][item.option_id].count++;
            }
          });
        })
      })

      disableParams(countParams, self)
    }

    var checkProductPermissionToBuy = function (element){

      var productAllowToBuy
      if ($(element).parents('[data-productallowtobuy="true"]').length){
        productAllowToBuy = true
      }else if ($(document).find(`[data-hash="${$(element).parents('[data-parent-hash]').data('parent-hash')}"`).data('productallowtobuy') == true){
        productAllowToBuy = true
      }else{
        productAllowToBuy = false
      }

      return productAllowToBuy
    }

    var setParameter = function(element){
      data.maxAmount = 0;

      if (!data.isCart) {
        if(document.querySelector('.core_counterValue')) {
          data.maxAmount = Number(document.querySelector('.core_counterValue').value)
        }
      }

      var input = element.hasClass('select-field-select2') ? element.find('option:checked') : element,
          stocksSelected = [],
          param = {
            key: input[0].getAttribute('name').split('_').pop(),
            id: parseFloat(input[0].getAttribute('name').split('_').pop().split('-').shift()),
            option: parseFloat(input[0].value),
            productId: parseFloat(input[0].getAttribute('name').split('_').pop().split('-').pop())
          };

      if(data.stocks[param.productId].groups.indexOf(param.id) > -1){
        if(SkyShop.card.stocks.storable[data.hash].stocksSelectedLastGroup != param.id){
          SkyShop.card.stocks.storable[data.hash].stocksSelectedLast = JSON.parse(JSON.stringify(SkyShop.card.stocks.storable[data.hash].stocksSelected));
        }

        SkyShop.card.stocks.storable[data.hash].stocksSelectedLastGroup = param.id;
        SkyShop.card.stocks.storable[data.hash].stocksSelected[param.key] = param.option;

        data.stocks[param.productId].stocks.forEach(function(stock){
          var count = 0,
              countLast = 0,
              search = Object.keys(SkyShop.card.stocks.storable[data.hash].stocksSelected).length,
              searchLast = Object.keys(SkyShop.card.stocks.storable[data.hash].stocksSelectedLast).length;

          const countProductParams = Object.keys(SkyShop.card.stocks.storable[data.hash].stocksSelected).reduce((acc, key) => {
            const id = key.split('-').pop()

            return id == param.productId ? [...acc, id] : acc
          }, []).length

          if(stock.amount > 0 || checkProductPermissionToBuy(element)){
            stock.items.forEach(function(item){
              if(item.option_id == SkyShop.card.stocks.storable[data.hash].stocksSelected[`${item.group_id}-${param.productId}`]){
                count++;
                // countLast++;
              }
            });
          }

          if(count == countProductParams || countLast == searchLast && countLast > 0){
            stocksSelected.push(stock);
          }
        });

        data.stocks[param.productId].stocks[0].items.forEach(function(item){
          var field = self.find('[data-key="' + item.group_id + '-' + param.productId + '"]');

          if(field.hasClass('select-field-select2')){
            field.find('option').attr('disabled','disabled');
          }else{
            field.find('input[type="radio"]').parent().addClass('disable');
          }
        });

        stocksSelected.forEach(function(item){
          if(item.amount > data.maxAmount && data.isCart){
            data.maxAmount = item.amount;
          }

          item.items.forEach(function(option){
            var field = self.find('[data-key="' + option.group_id + '-' + param.productId + '"]');

            if(field.hasClass('select-field-select2')){
              field.find('option[value="' + option.option_id + '"]').removeAttr('disabled');
            }else{
              field.find('input[value="' + option.option_id + '"]').parent().removeClass('disable');
            }
          });
        });

        const chooseFields = data.isCard ? self.find(`.choose-field`) : self.find(`.choose-field[data-key='${param.key}']`);

        chooseFields.each(function(){
          var choose = $(this),
              chooseDisabled = choose.find('.checkbox-field.disable'),
              chooseSelected = choose.find('input:checked'),
              chooseClear = choose.find('.selection-clear'),
              chooseSize = 'small';

          if(chooseSelected.length > 0 && chooseClear.length == 0 && SkyShop.card.stocks.storable[data.hash].stocks[param.productId].groups.indexOf(Number(choose.data('key').split('-').shift())) > -1){
            if(chooseDisabled.eq(0).hasClass('medium')){
              chooseSize = 'medium';
            }
            if(chooseDisabled.eq(0).hasClass('big')){
              chooseSize = 'big';
            }

            choose.append([
              '<div class="selection-clear ' + chooseSize + '">',
              '&times;',
              '</div>'
            ].join(''));
          }
        });

        self.find('.select-field-select2').each(function(){
          var select = $(this),
              selectOptions = select.data('select2').options.options,
              selectError = false;

          if(select.nextAll('.ss-error').eq(0).length > 0){
            selectError = true;
            removeError(select.nextAll('.ss-error').eq(0));
          }
          if(selectError){
            addError(select.next(),select.data('required-error'));
          }
          select.select2('destroy').select2(selectOptions).next().addClass('select-field-select2-container');
        });


      }

    };

    var clearParameter = function(element,type){

      var input = element.hasClass('choose-field') ? element.find('input:checked') : element,
          stocksSelected = [],
          productAllowToBuy = false;

      if( input.length === 0) return

      var param = {
            key: input[0].getAttribute('name').split('_').pop(),
            id: parseFloat(input[0].getAttribute('name').split('_').pop().split('-').shift()),
            option: parseFloat(input[0].value),
            productId: parseFloat(input[0].getAttribute('name').split('_').pop().split('-').pop())
          };

      if(data.stocks[param.productId].groups.indexOf(param.id) > -1){
        var inputAmount = data.isCart ? self.parents('[data-hash]').eq(0).find('.product-count').find('.counter-field').find('input') : self.parents('.product-informations').eq(0).find('.product-add-to-cart').find('input');
        data.maxAmount = parseFloat(inputAmount.data('max'));

        if(type == 'choose-field'){
          element.find('input:checked').prop('checked',false);
          element.find('.selection-clear').remove();
        }

        SkyShop.card.stocks.storable[data.hash].stocksSelectedLastGroup = null;
        delete SkyShop.card.stocks.storable[data.hash].stocksSelected[param.key];

        const countProductParams = Object.keys(SkyShop.card.stocks.storable[data.hash].stocksSelected).reduce((acc, key) => {
          const id = key.split('-').pop()

          return id == param.productId ? [...acc, id] : acc
        }, []).length

        if(countProductParams == 0 || !checkProductPermissionToBuy(element)){
          data.stocks[param.productId].stocks[0].items.forEach(function(item){
            var field = $(document).find('[data-key="' + item.group_id + '-' + param.productId + '"]');

            if(field.hasClass('select-field-select2')){
              field.find('option').removeAttr('disabled');
            }else{
              field.find('input[type="radio"]').parent().removeClass('disable');
            }
          });

          disableParams(countParams, self)
        }else{

          data.stocks[param.productId].stocks.forEach(function(stock){
            var count = 0,
                countLast = 0,
               search = Object.keys(SkyShop.card.stocks.storable[data.hash].stocksSelected).length,
                searchLast = Object.keys(SkyShop.card.stocks.storable[data.hash].stocksSelectedLast).length;
            const countProductParams = Object.keys(SkyShop.card.stocks.storable[data.hash].stocksSelected).reduce((acc, key) => {
              const id = key.split('-').pop()

              if (id == param.productId) return [...acc, id]
              else return acc
            }, []).length
            if(stock.amount > 0){
              stock.items.forEach(function(item){
                if(item.option_id == SkyShop.card.stocks.storable[data.hash].stocksSelected[`${item.group_id}-${param.productId}`]){
                  count++;
                  // countLast++;
                }
              });
            }

            if(count == countProductParams || countLast == searchLast && countLast > 0){
              stocksSelected.push(stock);
            }
          });

          data.stocks[param.productId].stocks[0].items.forEach(function(item){
            var field = self.find('[data-key="' + item.group_id + '-' + param.productId + '"]');

            if(field.hasClass('select-field-select2')){
              field.find('option').attr('disabled','disabled');
            }else{
              field.find('input[type="radio"]').parent().addClass('disable');
            }
          });

          stocksSelected.forEach(function(item){
            if(item.amount > data.maxAmount){
              data.maxAmount = item.amount;
            }

            item.items.forEach(function(option){
              var field = self.find('[data-key="' + option.group_id + '-' + param.productId + '"]');

              if(field.hasClass('select-field-select2')){
                field.find('option[value="' + option.option_id + '"]').removeAttr('disabled');
              }else{
                field.find('input[value="' + option.option_id + '"]').parent().removeClass('disable');
              }
            });
          });
        }

        setTimeout(function(){
          self.find('.select-field-select2').each(function(){
            var select = $(this),
                selectOptions = select.data('select2').options.options;

            select.select2('destroy').select2(selectOptions).next().addClass('select-field-select2-container');
          });
        },0);

        inputAmount.data('max',data.maxAmount);

        if(parseFloat(inputAmount.val()) > data.maxAmount){
          inputAmount.val(data.maxAmount);
        }
      }
    };

    self.on('click','input[type="radio"], select.select-field-select2',function(){
      setParameter($(this));
    });

    self.on('select2:unselecting','.select-field-select2',function(){
      $(this).data('unselecting',true);

      clearParameter($(this).find('option[value="' + $(this).val() + '"]'),'select-field');
    }).on('select2:opening','.select-field-select2',function(e){
      if($(this).data('unselecting')){
        $(this).removeData('unselecting');
        e.preventDefault();
      }
    });
    self.on('click','.selection-clear',function(){
      clearParameter($(this).parents('.choose-field'),'choose-field');
    });

    if(typeof parameters !== 'undefined'){
      if(typeof parameters.build !== 'undefined'){
        parameters.build(product);
      }
    }
  });
});

$(document).on('ready',function(){
  var stockManage = $(document).find('.core_cardStocksManage');

  if(stockManage.parents('section.product-card').eq(0).length > 0){
    stockManage.trigger('stockManage');
  }
});


/* ================================================================================================================
 * CART FREE SHIPMENT LISTENER
 */

$(document).find('.core_cartFreeShipmentListener').each(function(){
  var self = $(this),
      body = $('body');

  var cartFreeShipmentListener = function(self){
    var freeShipmentValue;

    if(self.data('free-shipment') != ''){
      if(typeof self.data('free-shipment-type') !== 'undefined' && self.data('free-shipment-type') == 'netto'){
        freeShipmentValue = bruttoToNetto(self.data('free-shipment'),body.attr('data-tax'));
      }else{
        freeShipmentValue = self.data('free-shipment');
      }
    }else{
      freeShipmentValue = '';
    }

    var data = {
      freeShipmentValue: freeShipmentValue,
      cartSum: self.data('price'),
      toFreeShipment: 0,
      cartIsFreeShipment: $('.core_cartIsFreeShipment'),
      cartIsFreeShipmentActive: $('.core_cartIsFreeShipmentActive'),
      cartFreeShipment: $('.core_cartFreeShipment')
    };

    if(data.freeShipmentValue != ''){
      data.freeShipmentValue = parseFloat(data.freeShipmentValue);
      data.toFreeShipment = Big(data.freeShipmentValue).minus(data.cartSum);

      if(data.toFreeShipment > 0){
        data.cartIsFreeShipment.removeClass('hidden');
        data.cartIsFreeShipmentActive.addClass('hidden');
        data.cartFreeShipment.data('price',data.toFreeShipment);
      }else{
        data.cartIsFreeShipment.addClass('hidden');
        data.cartIsFreeShipmentActive.removeClass('hidden');
      }

      pricesFormatter(data.cartIsFreeShipment);
    }
  }

  cartFreeShipmentListener(self);

  $(document).on('DOMSubtreeModified','.core_cartFreeShipmentListener',function(){
    cartFreeShipmentListener(self);
  });
});


/* ================================================================================================================
 * CART PARAMS CHANGE
 */

$(document).on('change','.core_cartParamsChange',function(e){
  const self = $(this);
  const target = $(e.target);
  const parentId = self.parent().data('id');
  const [parameterId, productId] = target[0].name.split('_').pop().split('-');
  const productHash = Number(productId) === Number(parentId)
      ? self.parent().data('hash')
      : $(document).find(`[data-id='${productId}'][data-parent-hash='${self.parent().data('hash')}'`).attr('data-hash');

  SkyShop.cart.products[productHash].options[parameterId] = target.val();
    cartUpdate({
      hash: [productHash]
    });
});


/* ================================================================================================================
 * COUNTER VALUE
 */

$(document).on('change focus blur keyup valueincrease valuedecrease','.core_counterValue',function(e){
  var self = $(this),
      counter = self.parents('.counter-field').eq(0);

  clearTimeout(SkyShop.card.counterError);
  removeError(counter);

  let increaseButton = counter[0].querySelector('.counter-increase');
  let decreaseButton = counter[0].querySelector('.counter-decrease');

  var data = {
    value: self.val(),
    remember: self.data('remember'),
    min: self.data('real-min') ? parseFloat(self.data('real-min')) : parseFloat(self.data('min')),
    max:  $(self).data('productamountstatus') !== 'deny' && $(self).data('productamountstatus') !== 'hide'
            ?  self.data('max', 524288)
            :  parseFloat(self.data('max')),
    tick: parseFloat(self.data('tick')),
    boxamount: parseFloat(self.data('boxamount')),
    boxrestrict: parseFloat(self.data('boxrestrict')),
    realMin: parseFloat(self.data('real-min')),
    rules: {
      onlyNaturalPositive: /^\d*[1-9]\d*$/,
      withDotOrComma: /^\d+(?:\.\d{0,4})?$/
    },
    isOnlyWholePackages: self.data('boxrestrict-whole'),
    isAllowDotOrComma: function (){
      if (self.data('boxrestrict-whole') == false) {
        if (self.data('min').toString().replace(',', '.').split('.')[1] != 'undefined' ||
            self.data('data-boxrestrict').toString().replace(',', '.').split('.')[1] != 'undefined') {
          return true;
        }
        else {
          return false;
        }
      } else {
        return false;
      }
    }(),
    setError: function(message){
      addError(counter,message);

      counter.prev().children('.ss-error-help-open').trigger('mouseenter');

      SkyShop.card.counterError = setTimeout(function(){
        removeError(counter);
      },1500);
    },
    getNearDiv: function(value,div){
      var q = (Big(value).div(div) | 0),
          output1 = Big(div).times(q),
          output2 = (Big(value).times(div)) > 0 ? (Big(div).times((Big(q).plus(1)))) : (Big(div).times((Big(q).minus(1))));

      if(Math.abs(Big(value).minus(output1)) < Math.abs(Big(value).minus(output2))){
        if(output1 < data.min){
          return data.min;
        }
        if(output1 > data.max){
          return data.max;
        }
        return output1;
      }else{
        if(output2 < data.min){
          return data.min;
        }
        if(output2 > data.max){
          return data.max;
        }
        return output2;
      }
    }
  };

  let currentValue = Number(data.value)

  if (currentValue === data.min) {
    decreaseButton.setAttribute('disabled', '');
  }

  if (currentValue === data.max) {
    increaseButton.setAttribute('disabled', '');
  }

  if (currentValue > data.min) {
    decreaseButton.hasAttribute('disabled') ? decreaseButton.removeAttribute('disabled') : null;
  }

  if (currentValue < data.max) {
    increaseButton.hasAttribute('disabled') ? increaseButton.removeAttribute('disabled') : null;
  }

  switch(e.type){
    case 'change': // Trigger when focusout input and was changes
      var value = data.value,
          rule = data.isAllowDotOrComma ? data.rules.withDotOrComma : data.rules.onlyNaturalPositive,
          max = !isNaN(parseFloat(self.val())) ? data.getNearDiv(parseFloat(self.val()), data.tick) : null,
          tmp = 0;

      max = max !== null ? parseFloat(max) : null;

      if (data.value.toString !== '') {
        if (parseFloat(data.remember) < data.realMin) {
          data.remember = data.realMin;
        } else {
          data.remember = data.value;
        };
        self.val(data.remember)
      }

      if(value.indexOf(',')){
        value = data.value.replace(',','.');
      }

      if(!rule.test(value)){
        value = data.remember;
      }else{
        if(data.isOnlyWholePackages){
          value = Big(Math.floor(Big(value).div(data.boxrestrict))).times(data.boxrestrict);
          if (value < data.realMin) {
            value = data.realMin;
          }
        }else{
          value = data.getNearDiv(parseFloat(value),data.boxrestrict);
          if (value < data.realMin) {
            value = data.realMin;
          }

          if (max !== null && max >= data.max && Big(max).div(data.tick).mod(1) !== 0 ) {
            while ( Big(tmp).plus(data.tick) <= data.max ) {
              tmp = Big(tmp).plus(data.tick);
            }
            value = tmp;
          }
        }
      }

      self.val(value);
      break;
    case 'focusin': // Triger on focus
      self.data('remember',data.value);
      data.remember = data.value;
      self.val('');
      break;
    case 'focusout': // Trigger on blur
      if(!self.val().replace(/^\s+/g,'').length){
        self.val(data.remember);
      }
      break;
    case 'valueincrease': // Triger when click increase button

      var value = Big(parseFloat(data.value)).plus(
          typeof self.data('tick') !== 'undefined' ? data.tick : data.min
      );
      if (value <= data.max) {
        self.val(value);
      } else {
        data.setError(L['MAXIMUM_QUANTITY_REACHED']);
      }
      break;
    case 'valuedecrease': // Triger when click decrease button
      var value = Big(parseFloat(data.value)).minus(
          typeof self.data('tick') !== 'undefined' ? data.tick : data.min
      );

      if(value >= data.min){
        self.val(value);
      }else{
        data.setError(L['MINIMUM_QUANTITY_REACHED']);
      }
      break;
    case 'keyup': // Control what is bind from keyboard
      var value = data.value.replace(',','.'),
          split = value.split(''),
          rule = data.isAllowDotOrComma ? data.rules.withDotOrComma : data.rules.onlyNaturalPositive;

      if(!rule.test(value)){
        split.splice(-1,1);
        self.val(split.join(''));
      }

      break;
  }
});

/* ================================================================================================================
 * COUNTER VALUE CHANGE
 */

$(document).on('click','.core_counterValueChange',function(e){
  var self = $(this);

  var data = {
    type: 'value' + self.data('type'),
    counter: self.parents('.counter-field').eq(0).find('.core_counterValue')
  };

  if(data.counter.length > 0){
    data.counter.trigger(data.type).trigger('change');
  }
});


/* ================================================================================================================
 * SET LANGUAGE
 */

$(document).on('click','.core_setLanguage',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {

  };


});


/* ================================================================================================================
 * ADD TO CART
 */

$(document).on('click','.core_addToCart',function(e){
  e.preventDefault();

  var self = $(this),
      productCard = self.parents('.product-card');

  if(self.parents('.product-tile').length > 0){
    self.parents('.product-tile').addClass('product-hover');
  }

  removeAllErrors(productCard);
  var options = {},
      externalTextParam = {},
      errors = {},
      subproductId;
  if(productCard.length > 0){
    productCard.find('.core_parseOption').each(function(){
      var option = $(this), newOptionValue;
      if(typeof option.data('required') !== 'undefined' && option.data('required') === true){
        if(option.hasClass('select-field-select2')){
          if(option.val() == '' || option.val() == null){
            errors[option.data('key')] = 'required';
          }else{
            newOptionValue = option.val();
          }
        }else if(option.hasClass('text-parameter-box')){
          option.keyup(function(){
            removeError(option)
          })
          if(option.text().trim() === "" || option.text().length < 1 || option.text().length > option.data('limit-length')){
            errors[option.data('key')] = 'required';
          }else{
            newOptionValue = option.data('param-value-id');
            subproductId = option.data('subproduct-id');
            if (!externalTextParam[subproductId]) {
              externalTextParam[subproductId] = {};
            }
            externalTextParam[subproductId][newOptionValue] = option.text().trim();
          }
        }
        else{
          if(option.find('input:checked').length == 0){
            errors[option.data('key')] = 'required';
          }else{
            newOptionValue = option.find('input:checked').val();
          }
        }
      }
      if(typeof option.data('required') !== 'undefined' && option.data('required') === false){
        if(option.hasClass('select-field-select2')){
          if(option.val() != ''){
            newOptionValue = option.val();
          }
        }else if(option.hasClass('text-parameter-box') ){
          if(option.text().length > option.data('limit-length')){
            errors[option.data('key')] = 'required';
          }else if (option.text().length >= 1) {
            newOptionValue = option.data('param-value-id');
            subproductId = option.data('subproduct-id');
            if (!externalTextParam[subproductId]) {
              externalTextParam[subproductId] = {};
            }
            externalTextParam[subproductId][newOptionValue] = option.text().trim();
          }
        }
        else{
          if(option.find('input:checked').length > 0){
            newOptionValue = option.find('input:checked').val();
          }
        }
      }

      if (newOptionValue !== undefined) {
        const subProductId = option.data('subproduct-id');
        if (options[subProductId] === undefined) {
          options[subProductId] = {};
        }
        options[subProductId][option.data('key')] = newOptionValue;
      }
    });
  }
  if(Object.keys(errors).length > 0){

    $.each(errors,function(optionId,type){
      var errorContainer = $('.core_parseOption[data-key="' + optionId + '"]'),
          errorContainerElement = errorContainer;
      if(errorContainer.hasClass('select-field-select2')) errorContainerElement = errorContainer.next();
      if(errorContainer.hasClass('text-parameter-box')) errorContainerElement = errorContainer;

      if(type == 'required'){
        addError(errorContainerElement,errorContainer.data('required-error'));
      }
    });
    return false;
  }

  let amount;
  let productTileCounterInput = self.parents('.product-tile').find('.counter-field').find('input');

  if(productCard.length){
    amount = parseFloat(self.parents('.product-card').find('.counter-field').find('input').val());
  } else if (productTileCounterInput.length) {
    amount = parseFloat(productTileCounterInput.val());
  } else {
    amount = parseFloat(self.data('min'));
    if(isNaN(amount) || amount === 0){
      amount = 1;
    }
  }

  var data = {
    productId: self.data('product-id'),
    amount: amount,
    option: $.base64Encode(JSON.stringify(options)),
    externalTextOption: $.base64Encode(JSON.stringify(externalTextParam)),
    dropRef: $.base64Encode(location.pathname)
  };

  function addToFbPixel(param) {
    if (typeof fbq === "function" && param) {
      for (var key of Object.keys(param)) {
        fbq('track', key, param[key]);
      }
    }
  }
  function addEventToEdrone(eventObject) {
    if (
        _edrone
        && _edrone.hasOwnProperty('app_id')
        && _edrone.app_id
        && eventObject
    ) {
      for (var key of Object.keys(eventObject)) {
        _edrone[key] = eventObject[key];
      }
      _edrone.init();
    }
  }
  var url = '/cart/?json=1&p=' + data.productId + '&a=' + data.amount + '&o=' + data.option + '&drop_ref=' + data.dropRef ;
  if(data.externalTextOption.length){
    data.externalTextOption = data.externalTextOption.split('+').join('-');
    data.externalTextOption = data.externalTextOption.split('/').join('_');
  }
  function cartRedirect(response) {
    if(response.redirect_to_product == 1){
      window.location = response.url + '#opt_reqired_info';
    }
    if(response.redirect == 1){
      window.location = '/cart/';
    }
  }
  $.post(url,{ov: data.externalTextOption, productImgId: SkyShop.product.imgId},function(response){
    var analytics = response.analytics;
    if(response.user_error){
      popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],response.user_error,'error');
    }else{
      if(response.redirect_to_product == 1 || response.redirect == 1){
        if(analytics && analytics.fbp) {
          addToFbPixel(analytics.fbp);
          setTimeout(() => cartRedirect(response), 400);
        } else {
          cartRedirect(response);
        }
      }else{
        if(response.message != ''){
          popups.actionAlert(L['INFORMATION'],response.message,'info',function(){
            popups.addToCart(function(){
              if(self.parents('.product-tile').length > 0){
                self.parents('.product-tile').removeClass('product-hover');
              }
            });
          });
        }else{
          popups.addToCart(function(){
            if(self.parents('.product-tile').length > 0){
              self.parents('.product-tile').removeClass('product-hover');
            }
          });
        }
        //GTAG EVENT 'add_to_cart'
        gtagEvent('add_to_cart', {
          value: response.price  * response.amount,
          item: [{...response, item_list_name: response.catName}]
        });

        if(analytics.fbp) addToFbPixel(analytics.fbp);
        if(analytics.edrone) addEventToEdrone(analytics.edrone);
        updateCart('add',response,{});
      }
    }
  }, 'json')
  .fail(function(){
    popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],L['PLEASE_TRY_AGAIN'],'error');
  });
});


/* ================================================================================================================
 * REMOVE PARAMETER
 */
var debounceTimeout

$(document).on('click','.core_removeParameter',function(e){
  e.preventDefault();

  var self = $(this);
  self.css({display: 'none'})
  self.parents('label').trigger('click');
  if(self.parents('form').data('dynamic') === true){
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(function(){
      self.parents('form').submit();
    },1500);
  }
});

/* ================================================================================================================
 * PARAMETERS FILTER
 */
$('[data-dynamic="true"]').on('change', function(){
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(function () {
    $('[data-dynamic="true"]').trigger('submit')
  },1500)
})

/* ================================================================================================================
 * CLEAR PARAMETERS FILTER
 */
var filterCheckedParameters = function () {
  if( $('[id*="param-filter-"]').filter(':checked').length > 0){
    $('.resetFilters').removeClass('hidden')
  }else{
    $('.resetFilters').addClass('hidden')
  }

  if($('[data-dynamic]').attr('data-dynamic') === 'true') {
    $('.resetFilters').on('click', function (e) {
      $('[id*="param-filter-"]').each(function (index, singleFilter) {
        $(singleFilter).prop('checked', false)
        debounceTimeout = setTimeout(function () {
          $('[data-dynamic]').trigger('submit')
        }, 1500)
      })
    })
  }
}

var clearFilterEvent = function (e) {
  e.preventDefault()
  $('.core_removeParameter ').addClass('hidden')
  $('[id*="param-filter-"]').each(function (index, singleFilter){
    $(singleFilter).prop('checked', false)
    filterCheckedParameters()
  })
}

$('.resetFilters').on('click', clearFilterEvent)

$(document).on('ready', filterCheckedParameters)
$('[data-dynamic]').on('change', filterCheckedParameters)
$('[data-panel="parameters"]').on('click', function(){
  $('.swipe-panel-content').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
    filterCheckedParameters()
    $('.resetFilters').each(function (index, item){
      $(item).on('click', clearFilterEvent)
    })
  });

})

$(document).on('click', '.core_toggleSubProducts', (ev) => {
  const textToggle = $(ev.target).text()
  const parentHash = $(ev.target).closest('[data-hash]').data('hash');
  if($(document).outerWidth() <= 766){
    $(`[data-hash=${parentHash}]`).find('.product-set').toggleClass('open')
    $(ev.target).css({display: 'none'})
  }
  $('[data-parent-hash=' + parentHash + ']').each(function() {
    $(this).children('td:not(.hidden)').each(function () {
      $(this).slideToggle(300); // toggle td's
    });
  });
  $(ev.target).text(
      textToggle === L.SUB_PRODUCTS_SHOW_CART ? L.SUB_PRODUCTS_HIDE_CART : L.SUB_PRODUCTS_SHOW_CART);
});

$(document).on('click', '.core_toggleSubProductsHide', (ev) => {
  ev.preventDefault()
  const parentHash = $(ev.target).closest('[data-hash]').data('hash');
  $(`[data-hash=${parentHash}]`).find('.product-set').toggleClass('open')
  $(`[data-hash=${parentHash}]`).find('.core_toggleSubProducts').css({display: 'block'}).text(L.SUB_PRODUCTS_SHOW_CART)
});


/* ================================================================================================================
 * SHOW ALL PARAMETERS
 */

$(document).on('click','.core_showAllParameters',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {
    template: {
      elements: self.parents('tr[data-hash]').eq(0).find('.product-parameters').find('[class*=product-parameters-]:not(.product-parameters-all)'),
      table: [
        '<table class="product-parameters">',
        '{{:parameters:}}',
        '</table>'
      ].join(''),
      item: [
        '<tr>',
        '<td>{{:name:}}</td>',
        '<td>{{:option:}}</td>',
        '</tr>'
      ].join('')
    },
    values: {}
  };

  if(self.closest('.product-set').length > 0){
    data.template.elements = $(`[data-hash="${self.parent().parent().find('input').attr('name').split('id_')[1] }"]`).find('.product-parameters').find('[class*=product-parameters-]:not(.product-parameters-all)')
  }

  var manage = {
    getValue: function(select){
      var option = {
        key: select.data('key'),
        value: select.val()
      };

      data.values[option.key] = option.value;

    },
    getValues: function(){
      var container = $('.swal-shop-parameters-popup'),
          values = container.find('select.select-field-select2');
      values.each(function(){

        var select = $(this),
        selectedValue = select.find('[data-selected]').val() || select.find('[selected]').val()

        var option = {
          key: select.data('key'),
          value: selectedValue
        };

        data.values[option.key] = option.value;

        if(option.value === undefined || option.value === null) {
          $(select).val([]);
          initializeSelect2($(select),{dropdownParent: $('.swal-shop-parameters-popup')})
        }
      });

    },
    update: function(){
      var hash = data.template.elements.parents('[data-hash]').data('hash');
      const parentId = data.template.elements.parents('[data-hash]').data('id');

      let hashes = new Set();
      hashes.add(hash)
      data.template.elements.each(function(){
        var item = $(this),
            option, key;

        if(item.hasClass('product-parameters-select')){
          item = item.find('.select-field-select2');
          key = item.data('key');
          option = data.values[key];

          const [parameterId, productId] = item[0].name.split('_').pop().split('-');
          const productHash = Number(parentId) === Number(productId)
              ? hash
              : $(document).find(`[data-id='${productId}'][data-parent-hash]`).attr('data-hash')

          productHash !== hash && hashes.add(productHash)

          if(option != void 0){
            SkyShop.cart.products[productHash].options[parameterId] = option;

            item.find('option[selected]').removeAttr('selected');
            item.val(option).find('option[value="' + option + '"]').attr('selected','selected');
          }
        }
      });

      data.template.elements.find('.select-field-select2').select2('destroy');

      initializeSelect2(data.template.elements.find('.select-field-select2'));

      cartUpdate({
        hash: Array.from(hashes.values())
      });
    },
    render: function(){
      var table = data.template.table,
          items = '';

      data.template.elements.each(function(){
        var item = $(this),
            template = data.template.item;

        if (item[0].outerHTML.includes('product-parameters-name')) {
          if(item[0].outerHTML.includes('no-selected-parameters')){
            if ($(item[0]).find('.parameters-popup-subproduct-name').html().includes('$&','&amp;', '$&amp;')){
              const stringToEncode = specialCharacterNameToReplace($(item[0]).find('.parameters-popup-subproduct-name').html())
              $(item[0]).find('.parameters-popup-subproduct-name').text(stringToEncode)
            }
            template = item[0].outerHTML
          }else
          {
            template = item[0].innerHTML;
          }
        } else {
          var option = {
            name: item.children('td').eq(0).html(),
            value: item.children('td').not(':eq(0)').not('.hidden')
          };
          if (option.name.includes('$&','&amp;', '$&amp;')) {
            const stringToEncode = specialCharacterNameToReplace(option.name)
            option.name = stringToEncode
          }
          template = template.replace(/{{:name:}}/g,option.name);

          if($(option.value).hasClass('product-option-select')){
            option.option = $(option.value).find('.select-field-select2')[0].outerHTML;
          }
          if($(option.value).hasClass('product-option-text')){
            option.option = $(option.value).children()[0].outerHTML;
          }
          if (option.option.includes('$&','&amp;', '$&amp;')) {
            const stringToEncode = specialCharacterNameToReplace(option.option)
            option.option = stringToEncode
          }
          template = template.replace(/{{:option:}}/g,option.option);
        }
        items = items + template;
      });
      table = table.replace('{{:parameters:}}', items);
      return $(table);
    }
  };


  swal({
    width: 500,
    customClass: 'swal-shop-parameters-popup',
    confirmButtonText: L['APPLY'],
    confirmButtonClass: 'btn',
    title: L['PARAMETERS_LIST'],
    html: manage.render(),
    onOpen: function(){
      var container = $('.swal-shop-parameters-popup');

      initializeSelect2(container.find('.select-field-select2'),{
        dropdownParent: container
      });

      container.find('.select-field-select2').on('change',function(){
        manage.getValue($(this));
      });
      manage.getValues();

      container.find('.no-selected-parameters').map((i, el) => {
        if ($(el).find('.parameters-popup-subproduct-name').text().includes('&#36&#38')){
          $(el).find('.parameters-popup-subproduct-name').text($(el).find('.parameters-popup-subproduct-name').text().split('&#36&#38').join('$&'))
        }
      })

      setTimeout(() => {
        $('.swal2-content')[0].scrollIntoView({behavior: "smooth", block: 'start', inline: "start"});
      }, 0)
    },
  }).then(function(event){
    manage.update();
  });
});


/* ================================================================================================================
 * REMOVE FROM CART
 */

$(document).on('click','.core_removeFromCart',function(e){
  e.preventDefault();

  var self = $(this),
      removeProductName = self.parents('[data-hash]').find('.product-name').text().trim(),
      removeProductPrice = self.parents('[data-hash]').find('.product-price .core_cartItemPrice').data('price')

  var data = {
    id: self.parents('[data-hash]').data('id'),
    hash: self.parents('[data-hash]').data('hash'),
    amount: self.parents('[data-hash]').find('input[name*="amount_"]').val(),
    amountQuick: self.parents('[data-hash]').data('amount')
  };

  if(typeof data.amount === 'undefined'){
    data.amount = data.amountQuick;
  }

  var url = '/cart/?json=1&rem=rem_' + data.hash + '_' + data.amount;

  $.getJSON(url,function(response){
    if(response.user_error){
      popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],response.user_error,'error');
    }else{
      var inCart = typeof data.id === 'undefined' ? false : true;

      if(inCart){
        updateCart('remove',response,{
          hashes: response.hashes,
          inCart: inCart,
          callback: function(){
            cartUpdate();
          }
        });

        //GTAG EVENT 'remove_from_cart'
        gtagEvent('remove_from_cart', {
          id: data.id,
          name: removeProductName,
          price : removeProductPrice,
          amount: data.amount
        });
      }else{
        updateCart('remove',response,{
          hashes: response.hashes,
          inCart: inCart
        });

        //GTAG EVENT 'remove_from_cart'
        gtagEvent('remove_from_cart', {
          id: parseInt(self.parents('[data-hash]').find('.product-name').parent()[0].href.split('-p')[1]),
          name: removeProductName,
          price : self.parents('[data-hash]').find('.core_priceFormat').data('price'),
          amount: data.amount
        });
      }
    }
  });
});


/* ================================================================================================================
 * ADD TO STORE
 */

$(document).on('click','.core_addToStore',function(e){
  e.preventDefault();

  var self = $(this);
  const icon = self.children('i');
  let label = self.children('span');

  if(self.parents('.product-tile').length > 0) self.parents('.product-tile').addClass('product-hover');

  var data = {
    productId: self.data('product-id')
  };
  var url = '/cart/?json=1&store=1&p=' + data.productId;

  $.getJSON(url,function(response){
    if(response.user_error){
      popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],json.user_error,'error');
    }else{
      icon.addClass('fa-heart').removeClass('fa-heart-o');
      self.removeClass('core_addToStore').addClass('core_removeFromStore');

      if (label[0]) label[0].innerText = L['PRODUCT_IN_STORE'];

      popups.actionAlert(L['INFORMATION'],L['PRODUCT_ADDED_TO_STORE'],'success',function(){
        if(self.parents('.product-tile').length > 0){
          self.parents('.product-tile').removeClass('product-hover');
        }
      });

      if(self.parents('.product-tile').length > 0) {
        gtagEvent('add_to_wishlist', {
          id: self.data('product-id'),
          name: self.closest('.product-tile').find('.product-name').text().trim(),
          price: self.closest('.product-tile').find('.core_priceFormat').data('price'),
          amount: 1
        });
      }else{
        typeof cardProductPageObject !== 'undefined' && cardProductPageObject !== null
            ? gtagEvent('add_to_wishlist', {
              id: cardProductPageObject.id,
              name: cardProductPageObject.name,
              price: cardProductPageObject.price,
              amount: 1
            })
            : null
      }

      $('a[href="/category/c/store/"] span').text('(' + response?.amount_total + ')')
    }
  }).error(function(){
    popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],L['PLEASE_TRY_AGAIN'],'error');
  });
});


/* ================================================================================================================
 * REMOVE FROM STORE
 */

$(document).on('click','.core_removeFromStore',function(e){
  e.preventDefault();

  var self = $(this);
  const icon = self.children('i');
  let label = self.children('span');

  var data = {
    productId: self.data('product-id')
  };
  var url = '/cart/?json=1&rem_store=' + data.productId;

  $.getJSON(url,function(response){
    if(response.user_error){
      popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],json.user_error,'error');
    }else{
      if (icon.hasClass('fa-heart')) {
        icon.addClass('fa-heart-o').removeClass('fa-heart');
        self.removeClass('core_removeFromStore').addClass('core_addToStore');

        if (label[0]) label[0].innerText = L['ADD_TO_STORE'];
      } else {
        self.parents('figure').eq(0).parent().remove();
      }

      popups.actionAlert(L['INFORMATION'],L['PRODUCT_REMOVED_FROM_STORE'],'success');
      $('a[href="/category/c/store/"] span').text('(' + response?.amount_total + ')')
    }
  }).error(function(){
    popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],L['PLEASE_TRY_AGAIN'],'error');
  });
});


/* ================================================================================================================
 * ASK QUESTION OPEN POPUP
 */

$(document).on('click','.core_askQuestionOpenPopup',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {
    productId: self.data('product-id')
  };

  popups.askAboutProduct(data.productId);
});


/* ================================================================================================================
 * ASK QUESTION
 */

$(document).on('click','.core_askQuestion',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {
    productId: self.data('product-id'),
    username: self.parents('form').eq(0).find('input[name="username"]').val(),
    email: self.parents('form').eq(0).find('input[name="email"]').val(),
    text: self.parents('form').eq(0).find('textarea[name="text"]').val(),
    validate: formValidator(self.parents('form').eq(0)),
    is_js: self.parents('form').find('.pro-tecting-_-Input').val()
  };
  var url = '/product/?json=1&action=phone';

  if(data.validate){
    $.post(url,{
      prod_id: data.productId,
      email: data.email,
      sky_validate: 1,
      body: L['SIGNATURE'] + ': ' + data.username + '<hr />' + data.text,
      is_js: data.is_js
    },function(response){

      if(typeof response === 'string') {
        response = JSON.parse(response);
      }


      if(response.msg){
        popups.actionAlert(L['EMAIL_WAS_SENT'],response.msg,'success');
      }else if(response.error) {
        popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],response.error_msg,'error');
      }else{
        popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],L['ERROR_CRITICAL_MESSAGE'],'error');
      }
    });
  }
});


/* ================================================================================================================
 * SEND PHONE
 */

$(document).on('click','.core_sendPhone',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {
    productId: self.parent().find('input[name="phone_number_box"]').data('product-id'),
    number: self.parent().find('input[name="phone_number_box"]').val(),
    is_js: self.parent().find('.pro-tecting-_-Input').val()
  };
  var url = '/product/?json=1&action=phone';

  if(!isNaN(parseFloat(data.number.split(' ').join(''))) && data.number.match(/\d/g).length > 6){
    $.post(url,{
      prod_id: data.productId,
      phone: data.number,
      is_js: data.is_js
    },function(response){

      if(typeof response === 'string') {
        response = JSON.parse(response);
      }

      if(response.msg){
        popups.actionAlert(L['NUMBER_WAS_SENT'],response.msg,'success');

        self.parents('.row').eq(0).transition('slideUp',200,function(){
          self.parents('.row').eq(0).remove();
        });
      }else if(response.error) {
        popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],response.error_msg,'error');
      }else{
        popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],L['ERROR_CRITICAL_MESSAGE'],'error');
      }
    });
  }else{
    popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],L['ERROR_PHONE_IS_INVALID'],'error');
  }
});


/* ================================================================================================================
 * ADD OPINION
 */

$(document).on('click','.core_addOpinion',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {
    productId: self.attr('name'),
    username: self.parents('form').find('input[name="username"]').val(),
    text: self.parents('form').find('textarea[name="text"]').val().replace(/"/g, '\''),
    quality: self.parents('form').find('input[name="quality"]').val(),
    usability: self.parents('form').find('input[name="usability"]').val(),
    price: self.parents('form').find('input[name="price"]').val(),
    is_js: self.parents('form').find('.pro-tecting-_-Input').val()
  };
  var url = window.location.pathname + '/json/1';

  if(!data.username || !data.quality || !data.usability || !data.price || !data.text){
    popups.actionAlert(L['PRODUCT_WAS_NOT_EVALUATED'],L['ADD_RATING_MUST_BE_COMPLETED_WITH_ALL_SIGNATURES'],'error');
  }else{
    $.post(url,{
      ajax: 1,
      quality: data.quality,
      usability: data.usability,
      price: data.price,
      username: data.username,
      text: data.text,
      is_js: data.is_js
    },function(response){

      if(typeof response === 'string') {
        response = JSON.parse(response);
      }

      if(response.user_error){
        popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],response.user_error,'error');
      }else if(response.errors){
        popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],response.errors[0],'error');
      }else{

        popups.actionAlert(L['RATING_HAS_BEEN_ADDED'],response.message,'success');

        self.parents('form').transition('slideUp',1000);
      }
    });
  }
});


/* ================================================================================================================
 * LOAD CART
 */

$(document).find('.core_loadCart').each(function(){
  var self = $(this);

  cartUpdate({
    wait: 0,
    rendered: function(){
      self.find('.core_cardStocksManage').trigger('stockManage',[{
        build: function(stock){
          stock.find('.product-parameters-select').each(function(){
            var select = $(this).find('.select-field-select2'),
                value = select.find('[data-selected]').val();
            if(typeof value !== 'undefined'){
              select.val(value).trigger('click');
            }
          });
        }
      }]);
    }
  });
});


/* ================================================================================================================
 * LOAD CARD
 */

$(document).find('.core_loadCard').each(function(){
  var self = $(this);

  self.find('.core_cardParamsChange').trigger('change');
});


/* ================================================================================================================
 * ADD DISCOUNT COUPON
 */

$(document).on('click','.core_addDiscountCoupon',function(e, isTriggeredBySubmit){
  e.preventDefault();

  var self = $(this);

  var data = {
    code: self.parents('.row').find('input[name="code_discount"]').val()
  };

  if(data.code != ''){
    cookies.create('ac_code',data.code,0);

    cartUpdate({
      wait: 100,
      blockade: 1000
    },function(){
      if(isTriggeredBySubmit) $('.core_submitCart').trigger('submit')
    });
  }
});


/* ================================================================================================================
 * REMOVE DISCOUNT COUPON
 */

$(document).on('click','.core_removeDiscountCoupon',function(e){
  e.preventDefault();

  cookies.erase('ac_code');
  cookies.erase('ac_freeDeliveryCoupon')
  SkyShop.order.freeDeliveryCoupon = null
  cartUpdate({
    blockade: 1000
  });
});


/* ================================================================================================================
 * USE LOYALTY POINTS
 */

$(document).on('click','.core_useLoyaltyPoints',function(e){
  e.preventDefault();
  cartUpdate({
    blockade: 1000
  });
});

/* ================================================================================================================
 * SET LOYALTY POINTS
 */

$(document).on('change focus blur keyup valueincrease valuedecrease','.core_setLoyaltyPoints',function(e){
  e.preventDefault();
  const self = $(this);
  const data = {
    value: self.val(),
    remember: self.data('remember'),
    rules: {
      onlyNaturalPositive: /^\d*[0-9]\d*$/
    }
  };

  switch(e.type){
    case 'focusin':
      self.data('remember',data.value);
      data.remember = data.value;
      self.val('');
      break;
    case 'focusout': // Trigger on blur
      if(!self.val().replace(/^\s+/g,'').length){
        self.val(data.remember);
      }
      break;
    case 'valueincrease':
      var value = parseInt(data.value);
      self.val(++value);
      break;
    case 'valuedecrease':
      var value = parseInt(data.value);
      self.val(--value);
      break;
    case 'change':
      if(data.rules.onlyNaturalPositive.test(data.value)){
        self.data('remember',data.value);
        self.val(data.value);
      } else {
        self.val(data.remember);
      }
      cookies.create('ac_loyalty',data.value,0);
      cartUpdate({
        wait: 300
      });
      break;
    case 'keyup':
     var value = data.value.replace(',','.');
     var split = value.split('');
     if(!data.rules.onlyNaturalPositive.test(value)){
       split.splice(-1,1);
       self.val(split.join(''));
     }
      break;
    default:
      break;
  }
});

/* ================================================================================================================
 * LOYALTY POINTS CHANGE
 */

$(document).on('click','.core_loyaltyPointsChange',function(e){
  e.preventDefault();

  const self = $(this);
  const data = {
    type: 'value' + self.data('type'),
    counter: self.parents('.counter-field').eq(0).find('.core_setLoyaltyPoints')
  };
  if(data.counter.length > 0){
    data.counter.trigger(data.type).trigger('change');
  }
});




/* ================================================================================================================
 * REGISTER FORM
 */

$(document).on('submit','.core_registerForm',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {
    validate: formValidator(self),
    name: 'sky_validate',
    value: 1
  };

  if(data.validate){
    self.append($('<input type="hidden" name="' + data.name + '" value="' + data.value + '" />'));
    self.removeClass('core_registerForm');

    setTimeout(function(){
      self.find('[type="submit"]').eq(0).trigger('click');
    },200);
  }
});


/* ================================================================================================================
 * REGISTER DONE
 */

$(document).find('.core_registerDone').each(function(){
  var self = $(this);

  var data = {
    message: self.data('message'),
    email: self.data('email')
  };

  //GTAG EVENT 'sign_up'
  gtagEvent('sign_up', {}, 'email');

  data.message = data.message.split('[EMAIL]').join(data.email);

  popups.actionAlert(L['REGISTRATION_WAS_SUCCESSFUL'],data.message,'success',function(){
    window.location = '/';
  });

});


/* ================================================================================================================
 * POP UP WINDOW
 */

$(document).find('.core_popUpWindow').each(function(){
  var self = $(this);

  var data = {
    message: self.data('popup-message'),
    delay: self.data('popup-delay') * 1000
  };

  if ( !self.hasClass('core_newsletterPopUpWindow')){
    setTimeout(function(){
      popups.actionAlert(L['INFORMATION'],data.message,'info');
    },data.delay);
  }

});


/* ================================================================================================================
 * NEWSLETTER POP UP WINDOW
 */

$(document).find('.core_newsletterPopUpWindow').each(function(){
  var self = $(this);

  var data = {
    message: self.data('newsletter-popup-message'),
    delay: self.data('newsletter-popup-delay') * 1000,
    infoPopupmessage: self.data('popup-message'),
    infoPopupDelay: self.data('popup-delay') * 1000
  };

  if ( !self.hasClass('core_popUpWindow')){
    setTimeout(function(){
      popups.newsletter(data.message);
    },data.delay);
  }else{
    if(data.delay === data.infoPopupDelay) {
      setTimeout(function(){
        popups.actionAlert(L['INFORMATION'],data.infoPopupmessage,'info', function (){
          setTimeout(function (){
            popups.newsletter(data.message);
          },data.delay);
        });
      },data.infoPopupDelay);
    }
    else if (data.delay < data.infoPopupDelay){
      setTimeout(function(){
        popups.newsletter(data.message, function (){
          setTimeout(function (){
            popups.actionAlert(L['INFORMATION'],data.infoPopupmessage,'info');
          }, data.infoPopupDelay)
        });
      },data.delay);
    }
    else if (data.delay > data.infoPopupDelay){
      setTimeout(function(){
        popups.actionAlert(L['INFORMATION'],data.infoPopupmessage,'info', null, function (){
          setTimeout(function (){
            popups.newsletter(data.message);
          }, data.delay)
        });
      }, data.infoPopupDelay)
    }
  }


});


/* ================================================================================================================
 * NEWSLETTER POP UP WINDOW
 */

$(document).find('.core_newsletterUnsubscribe').each(function(){
  var self = $(this);

  var url = window.location.href + '?json=1';

  popups.yesNo(L['RESIGN_WITH_NEWSLETTER'],L['CONFIRM_REMOVE_NEWSLETTER'],'info',
      function(){
        $.post(url,{
          remove_newsletter_yes: 1
        },function(response){

          if(typeof response === 'string') {
            response = JSON.parse(response);
          }

          if(response.success == false){
            popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],L['PLEASE_TRY_AGAIN'],'error');
          }else{
            popups.actionAlert(L['INFORMATION'],L['PDF_THIRD_INFO'],'success',function(){
              window.location = '/';
            });
            setTimeout(function(){
              window.location = '/';
            },5000);
          }
        });
      },function(){
        window.location = '/';
      }
  );
});


/* ================================================================================================================
 * CHANGE EMAIL
 */

$(document).on('submit','.core_changeEmail',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {
    email: self.find('input[name="user_email"]').val(),
    validate: formValidator(self)
  };
  var url = '/register/emailchange/1/?json=1';

  if(data.validate){
    $.ajax({
      type: 'POST',
      url: url,
      data: {
        user_email: data.email
      },
      dataType: 'json',
      success: function(response){
        if(response.success == true){
          popups.actionAlert(L['EMAIL_WAS_SENT'],response.msg,'success');
        }else{
          if(typeof response.errors === 'object' && response.errors.length > 0){
            response.errors.forEach(function(error){
              popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],error,'error');
            });
          }
        }
      }
    });
  }
});


/* ================================================================================================================
 * CHANGE PASSWORD
 */

$(document).on('submit','.core_changePassword',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {
    email: self.find('input[name="email"]').val(),
    password: self.find('input[name="password"]').val(),
    validate: formValidator(self)
  };
  var url = '/passrecover/?json=1';

  if(data.validate){
    $.ajax({
      type: 'POST',
      url: url,
      data: {
        email: data.email,
        password: data.password,
        submit: 1
      },
      dataType: 'json',
      success: function(response){
        if(response.success == true){
          popups.actionAlert(L['INFORMATION'],response.msg,'success');
        }else{
          if(typeof response.errors === 'object' && response.errors.length > 0){
            response.errors.forEach(function(error){
              popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],error,'error');
            });
          }
        }
      }
    });
  }
});


/* ================================================================================================================
 * ADD EMAIL TO NEWSLETTER
 */

$(document).on('click','.core_addEmailToNewsletter',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {
    email: self.parents('form').find('input[name="email"]').val(),
    is_js: self.parents('form').find('.pro-tecting-_-Input').val()

  };
  var url = '/register/?json=1';

  $.post(url,{
    email: data.email,
    is_js: data.is_js
  },function(response){

    if(typeof response === 'string') {
      response = JSON.parse(response);
    }

    if(response.lang == 'NEWSLTETTER_THANKS'){
      popups.actionAlert(L['INFORMATION'],response.msg,'info');
    }else if(response.lang == 'EMAIL_BUSY' || response.lang == 'WRONG_EMAIL'){
      popups.actionAlert(L['INFORMATION'],response.msg,'error');
    }else{
      if(typeof response.user_error !== 'undefined'){
        popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],response.user_error,'error');
      }else{
        popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],response.errors.join(' '),'error');
      }
    }
  });
});


/* ================================================================================================================
 * ADD EMAIL TO NEWSLETTER POPUP
 */

$(document).on('submit','.core_addEmailToNewsletterPopup',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {
    email: self.find('input[name="email"]').val(),
    validate: formValidator(self),
    is_js: self.find('input[name="is_js"]').val()
  };
  var url = '/register/?json=1';

  if(data.validate){
    $.post(url,{
      email: data.email,
      is_js: data.is_js
    },function(response){

      if(typeof response === 'string') {
        response = JSON.parse(response);
      }

      if(response.lang == 'NEWSLTETTER_THANKS'){
        popups.actionAlert(L['INFORMATION'],response.msg,'info');
      }else if(response.lang == 'EMAIL_BUSY' || response.lang == 'WRONG_EMAIL'){
        popups.actionAlert(L['INFORMATION'],response.msg,'error');
      }else{
        popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],response.user_error,'error');
      }
    });
  }
});


/* ================================================================================================================
 * ACCEPT COOKIES
 */

$(document).on('click','.core_acceptCookies',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {
    cookiesElement: self.parents('.cookies'),
    accept: 1
  };

  cookies.create('co_accept',data.accept,365 * 24 * 60 * 60 * 1000);

  data.cookiesElement.transition('slideUp',200,function(){
    data.cookiesElement.eq(0).remove();
  });
});


/* ================================================================================================================
 * ADD TICKET
 */

$(document).on('submit','.core_addTicket',function(e){
  e.preventDefault();

  var self = $(this);

  removeAllErrors(self);

  var data = {
    error: self.data('error'),
    errorRequired: self.data('error-required'),
    title: self.find('input[name="title"]').val(),
    email: self.find('input[name="email"]').val(),
    text: self.find('textarea[name="text"]').val(),
    order_id: self.find('input[name="order_id"]').val(),
    is_js: self.find('.pro-tecting-_-Input').val(),
    csrf_token: self.find('input[name="csrf_token"]').val()
  };
  var url = '/ticket/?json=1';

  if(!data.title || !data.email || !data.text){
    if(!data.title){
      addError(self.find('input[name="title"]'),data.errorRequired);
    }
    if(!data.email){
      addError(self.find('input[name="email"]'),data.errorRequired);
    }
    if(!data.text){
      addError(self.find('textarea[name="text"]'),data.errorRequired);
    }

    popups.actionAlert(L['INFORMATION'],data.error,'error');
  }else{
    var postData = {
      title: data.title,
      email: data.email,
      text: data.text,
      submit: 'submit',
      is_js: data.is_js,
      csrf_token: data.csrf_token
    }

    if(data.order_id){
      postData['order_id'] = data.order_id;
    }

    $.post(url,postData,function(response){
      try {
        var decodedResponse = response

        if(typeof response === 'string') {
          decodedResponse = JSON.parse(response);
        }

      } catch(e) {
        popups.actionAlert(L['INFORMATION'],L['ERROR_UNEXPECTED_ERROR'],'error');
      }

      if (decodedResponse.type === 'BOT_PROTECT')
      {
        popups.actionAlert(L['INFORMATION'],L['FORM_VALIDATION_FAILED_JS'],'error');
        return;
      }

      if (decodedResponse.type === 'CSRF_PROTECT') {
        popups.actionAlert(L.INFORMATION, L.ERROR_NOT_UNIQUE, 'error');
        return;
      }

      window.location = '/ticket/sended';
    });
  }
});


/* ================================================================================================================
 * SHOW DISCOUNT INFO
 */

$(document).on('click','.core_showDiscountInfo',function(e){
  e.preventDefault();

  var self = $(this);

  var data = {
    info: self.data('info')
  };

  popups.actionAlert(L['INFORMATION'],data.info,'info');
});


/* ================================================================================================================
 * NOTIFY AVAILABLE PRODUCT
 */

$(document).on('click','.core_notifyAvailableProduct',function(e){
  var self = $(this);

  var data = {
    value: self.prop('nodeName') == 'INPUT' ? self.val() : self.prev().val(),
    productId: self.data('product-id'),
    success: self.data('success')
  };
  var url = '/product/?json=1&action=available_notify';

  if(data.value == '1'){
    var typeEmail = self.parents('.product-notify-available-product').find('.product-notify-available-product-type-email');

    if(self.prop('checked') == true){
      typeEmail.transition('slideDown',200);
    }else{
      typeEmail.transition('slideUp',200);
    }
  }else{
    $.ajax({
      type: 'POST',
      url: url,
      data: {
        prod_id: data.productId,
        email: data.value
      },
      dataType: 'json',
      success: function(response){
        if(response.success == true){
          data.success = data.success.replace('[[EMAIL]]',' (' + data.value + ')');
          popups.actionAlert(L['EMAIL_WAS_SAVE'],data.success,'success');
          self.parents('.row').eq(0).transition('slideUp',200,function(){
            self.parents('.row').eq(0).remove();
          });
        }else{
          if(response.message === 'notification exists for this email'){
            popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'],L['NOTIFICATION_EXIST_FOR_EMAIL'],'error');
          }else {
            popups.actionAlert(L['ERROR_UNEXPECTED_ERROR'], L['PLEASE_TRY_AGAIN'], 'error');
          }
        }
      }
    });
  }
});


/* ================================================================================================================
 * LOGIN HURT TRIGGER LOGIN
 */
$(document).on('click','.core_loginHurtTriggerLogin',function(e){
  e.preventDefault();

  var self = $(this),
      loginHurt = $('.login-hurt');
  loginHurt.find('form').eq(0).find('[type="submit"]').trigger('click');

});


/* ================================================================================================================
 * SCB RATY
 */

$(document).on('click','.core_scbRaty',function(e){
  var self = $(this);

  var data = {
    price: self.data('price'),
    scb: self.data('scb')
  };
  var url = 'https://wniosek.eraty.pl/symulator/oblicz/numerSklepu/' + data.scb + '/typProduktu/0/wartoscTowarow/' + data.price;

  window.open(url,'Policz_rate','width=630,height=500,directories=no,location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,toolbar=no');
});


/* ================================================================================================================
 * PRAGMAGO
 */

var pragmagoSelector = document.getElementById('openPragmaPopUp');

const openInNewWindow = (installments) => {
  window.open(`${installments ? 'https://pragmago.pl/calculator/?raty=' + installments : 'https://pragmago.pl/calculator/'}`, "_blank", "toolbar=false,scrollbars=yes,resizable=0,resizable=false,resizable=no,,top=50%,left=50%,width=899,height=600");
};

if ($('#openPragmaPopUp').length) {
  $('#openPragmaPopUp').on('click', (e) => openInNewWindow(pragmagoSelector.dataset.numberInstalments))
}


/* ================================================================================================================
 * PayPo
 */

if ($('#paypo_display_widget').length) {
  window.addEventListener('DOMContentLoaded',function(){document.querySelector('#paypo_display_widget').insertAdjacentHTML('beforebegin','<svg class="paypo__open" viewBox="0 0 600 120" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M0 0h600v120H0z" fill="#fff" /><path d="M235.13 11.72h4.06v96.56h-4.06z" fill="#f6e7f2" /><path d="M59.24 63.03v9.44h-9.52v-9.44z" fill="#a41781" /><path d="M59.2 50.22v9.52h-9.52v-9.52z" fill="#3db288" /><path d="M46.5 62.9v9.52h-9.52V62.9z" fill="#fbd05c" /><path d="M87.6 49.63a11.87 11.87 0 0 1-12.09 11.84h-5.18v10.85h-7.9V37.8H75.5a11.87 11.87 0 0 1 12.09 11.84zm-7.9 0a4.21 4.21 0 0 0-4.19-4.44h-5.18v8.88h5.18a4.22 4.22 0 0 0 4.19-4.44zM115.13 47v25.3h-7.6v-2.38A9.52 9.52 0 0 1 100 73c-6.63 0-12.1-5.82-12.1-13.37s5.46-13.36 12.1-13.36a9.55 9.55 0 0 1 7.55 3.09V47zm-7.6 12.66a6.03 6.03 0 1 0-12.06 0 6.03 6.03 0 1 0 12.06 0zM144 47l-8.6 24.4c-2.82 8-7.3 11.17-14.33 10.82v-7c3.52 0 5.18-1.1 6.28-4.17l-10-24h8.3l5.6 15.4 4.7-15.43zm28.1 2.63A11.87 11.87 0 0 1 160 61.47h-5.18v10.85H147V37.8h13a11.87 11.87 0 0 1 12.11 11.84zm-7.9 0a4.22 4.22 0 0 0-4.2-4.44h-5.18v8.88H160a4.23 4.23 0 0 0 4.22-4.44zM173.1 60a13.07 13.07 0 1 1 13.07 13 12.93 12.93 0 0 1-13.07-13zm18.74 0a5.67 5.67 0 1 0-5.67 5.82 5.52 5.52 0 0 0 5.67-5.82z" fill="#010101" /><path d="M366.08 79.6h100.65v28.68H366.08z" fill="#3db286" /><path d="M386.44 95.54l2.07-1.2a2.22 2.22 0 0 0 2.21 1.46c1.15 0 1.43-.45 1.43-.86 0-.65-.6-.9-2.18-1.34s-3.1-1.2-3.1-3.2a3.3 3.3 0 0 1 3.54-3.21 4.09 4.09 0 0 1 3.85 2.38l-2 1.2a1.84 1.84 0 0 0-1.82-1.22c-.75 0-1.13.37-1.13.8s.26.8 1.9 1.3 3.38 1 3.38 3.27c0 2-1.62 3.23-3.9 3.23a4.14 4.14 0 0 1-4.24-2.6zm17.34-1.37a3.77 3.77 0 0 1-3.59 4 2.81 2.81 0 0 1-2.24-.91v3.7h-2.26V90.4h2.3v.7a2.82 2.82 0 0 1 2.24-.92 3.77 3.77 0 0 1 3.54 3.97zm-2.25 0a1.79 1.79 0 1 0-1.79 1.83 1.72 1.72 0 0 0 1.79-1.83zm8.04-3.9v2.56a1.77 1.77 0 0 0-2.25 1.71v3.4h-2.26V90.4h2.26v1.34a2.25 2.25 0 0 1 2.25-1.49zm8.55.14v7.52h-2.26v-.7a2.83 2.83 0 0 1-2.24.91 4 4 0 0 1 0-7.94 2.83 2.83 0 0 1 2.24.92v-.7zm-2.26 3.76a1.79 1.79 0 1 0-1.79 1.83 1.71 1.71 0 0 0 1.79-1.83zm14.6-3.76l-2.4 7.52h-2.1l-1.2-4-1.2 4h-2.1L419 90.4h2.4l1.08 4 1.17-4h2.1l1.17 4 1.1-4zm8.32-3v10.53h-2.25v-.7a2.85 2.85 0 0 1-2.25.91 4 4 0 0 1 0-7.94 2.85 2.85 0 0 1 2.25.92V87.4zm-2.25 6.77a1.8 1.8 0 1 0-1.8 1.84 1.72 1.72 0 0 0 1.8-1.84zm9.7 1.66v2.1h-6v-1.5l2.78-3.9h-2.7v-2.1h5.72v1.5l-2.85 3.9zM444 89.5h-2.16l1.2-2.1h2.7z" fill="#fff" /><path d="M311.67 30.15l-5.9-8.53v8.53h-4.2V11.72h4.2v8l5.63-8h4.8l-6.2 9 6.48 9.45zM329.83 17v13.15h-3.95V28.9a4.52 4.52 0 0 1-3.77 1.61c-2.65 0-4.92-1.9-4.92-5.45V17h3.95v7.5a2.17 2.17 0 0 0 2.29 2.39c1.45 0 2.45-.84 2.45-2.7V17zm17.05 6.57c0 3.92-2.84 7-6.3 7a5 5 0 0 1-3.92-1.61v6.5h-3.95V17h3.95v1.23a4.94 4.94 0 0 1 3.92-1.6c3.4-.01 6.3 3 6.3 6.94zm-3.95 0a3.13 3.13 0 1 0-6.26 0 3.13 3.13 0 1 0 6.26 0zm17.77-2.8v4.65c0 1.14 1 1.24 2.72 1.14v3.58c-5.16.52-6.66-1-6.66-4.72v-4.65h-2.1V17h2.1v-2.5l3.94-1.2V17h2.72v3.8zM372.06 27a3.45 3.45 0 0 0 2.53-1l3.16 1.8a6.69 6.69 0 0 1-5.75 2.71c-4.5 0-7.3-3-7.3-6.95a6.74 6.74 0 0 1 7-6.95 6.65 6.65 0 0 1 6.69 7 8.06 8.06 0 0 1-.16 1.58h-9.34a3 3 0 0 0 3.16 1.8zm2.43-4.8a3 3 0 0 0-5.66 0zm14.05-5.48v4.48c-1.63-.27-4 .4-4 3v5.95h-3.95V17h3.95v2.34a4 4 0 0 1 4-2.62zm14.96.28v13.15h-3.95V28.9a5 5 0 0 1-3.92 1.61c-3.45 0-6.3-3-6.3-6.95s2.84-6.95 6.3-6.95a4.94 4.94 0 0 1 3.92 1.6V17zm-3.95 6.58a3.14 3.14 0 1 0-6.27 0 3.14 3.14 0 1 0 6.27 0zm16.95 2.88v3.7H406v-2.63l5-6.85h-4.7V17h10v2.63l-5 6.84zm5.28 7.37h-3.16l1.05-7.76h4.2z" fill="#3db286" /><g fill="#1d1d1b"><path d="M443.3 26.2c0 3-2.63 4.32-5.47 4.32-2.63 0-4.63-1-5.66-3.14l3.42-1.95a2.16 2.16 0 0 0 2.24 1.57c.95 0 1.42-.3 1.42-.82 0-1.45-6.47-.68-6.47-5.24 0-2.86 2.42-4.3 5.15-4.3a5.76 5.76 0 0 1 5.14 2.81l-3.37 1.82a1.93 1.93 0 0 0-1.77-1.16c-.68 0-1.1.26-1.1.74 0 1.5 6.47.5 6.47 5.36zm16.27-2.63c0 3.92-2.84 7-6.3 7a4.92 4.92 0 0 1-3.92-1.61v6.5h-3.95V17h3.95v1.23a4.92 4.92 0 0 1 3.92-1.6c3.45-.01 6.3 3 6.3 6.94zm-3.95 0a3.13 3.13 0 1 0-6.26 0 3.13 3.13 0 1 0 6.26 0zm14.08-6.85v4.48c-1.63-.27-3.95.4-3.95 3v5.95h-3.95V17h3.95v2.34a4 4 0 0 1 3.95-2.62zm14.95.28v13.15h-3.95V28.9a5 5 0 0 1-3.92 1.61c-3.45 0-6.3-3-6.3-6.95s2.84-6.95 6.3-6.95a4.94 4.94 0 0 1 3.92 1.6V17zm-3.95 6.58a3.13 3.13 0 1 0-6.26 0 3.13 3.13 0 1 0 6.26 0zM506.23 17L502 30.15h-3.7l-2.1-7-2.1 7h-3.68L486.22 17h4.22l1.9 7 2.05-7h3.7l2.05 7 1.9-7zm14.55-5.28v18.43h-3.95V28.9a5 5 0 0 1-3.92 1.61c-3.45 0-6.3-3-6.3-6.95s2.84-6.95 6.3-6.95a4.94 4.94 0 0 1 3.92 1.6v-6.5zm-3.95 11.85a3.13 3.13 0 1 0-6.26 0 3.13 3.13 0 1 0 6.26 0zm16.97 2.9v3.7h-10.53v-2.63l5-6.85h-4.7V17h10v2.63l-5 6.84zm-3.85-11h-3.8l2.1-3.7H533zm-259.9 39.7c0 3.92-2.84 7-6.3 7a5 5 0 0 1-3.92-1.61V67h-4V48.57h4v1.23a4.94 4.94 0 0 1 3.92-1.6c3.45 0 6.3 3.03 6.3 6.95zm-3.95 0a3.13 3.13 0 1 0-3.11 3.21 3 3 0 0 0 3.11-3.21zm14.1-6.85v4.48c-1.63-.26-3.94.4-3.94 3v5.95h-3.95V48.57h3.95v2.34a4 4 0 0 1 3.94-2.61zm.8 6.85a7 7 0 1 1 7 7 6.9 6.9 0 0 1-7-7zm10 0a3 3 0 1 0-3 3.1 2.95 2.95 0 0 0 3-3.1z" /><use xlink:href="#B" /><path d="M326 48.57v13.16h-3.95V60.5a4.5 4.5 0 0 1-3.76 1.61c-2.66 0-4.92-1.9-4.92-5.45v-8.08h3.95v7.5a2.16 2.16 0 0 0 2.29 2.39c1.44 0 2.44-.84 2.44-2.7V48.6zm11.06 13.16l-4.2-5.82v5.82h-4V43.3h4v11l3.95-5.76h4.6l-4.8 6.58 4.92 6.58zm10.66-9.37V57c0 1.13 1 1.23 2.7 1.13v3.58c-5.16.52-6.66-1-6.66-4.7v-4.64h-2.1v-3.8h2.1v-2.5l4-1.2v3.7h2.7v3.8zm11.4-7.36a2.37 2.37 0 1 1 2.37 2.37 2.39 2.39 0 0 1-2.37-2.37zm.4 3.53h3.95v13.2h-3.95zM383.07 58v3.7h-10.53v-2.6l5-6.85h-4.74v-3.68h10v2.63l-5 6.84zm15.08-9.43v13.16h-3.95V60.5a5 5 0 0 1-3.92 1.61c-3.45 0-6.3-3-6.3-7s2.84-6.95 6.3-6.95a4.94 4.94 0 0 1 3.92 1.6v-1.18zm-3.95 6.58a3.14 3.14 0 1 0-3.13 3.21 3 3 0 0 0 3.13-3.21zm21 0c0 3.92-2.84 7-6.3 7a5 5 0 0 1-3.91-1.66V67h-4V48.57h4v1.23a4.94 4.94 0 0 1 3.92-1.6c3.44 0 6.28 3.03 6.28 6.95zm-3.95 0a3.13 3.13 0 1 0-3.13 3.21 3 3 0 0 0 3.13-3.21zm11.58-2.82l-1.32.9v8.5h-3.94v-5.8l-1.32.9v-3.76l1.32-.9V42.5h3.94v7l1.32-.9zM438 48.57v13.16h-4V60.5a4.92 4.92 0 0 1-3.92 1.61c-3.45 0-6.3-3-6.3-7s2.84-6.95 6.3-6.95a4.92 4.92 0 0 1 3.92 1.6v-1.18zm-4 6.58a3.13 3.13 0 1 0-3 3.21 3 3 0 0 0 3.09-3.21zm6.28 0a7 7 0 0 1 12.92-3.58l-3.45 2a2.72 2.72 0 0 0-2.55-1.48 3.06 3.06 0 0 0 0 6.11 2.69 2.69 0 0 0 2.55-1.47l3.45 2a6.73 6.73 0 0 1-5.95 3.4 6.82 6.82 0 0 1-6.97-6.98zm8.45-8.15l3-3.7H447l-2.06 3.7zm22.9 11v3.7H461.1v-2.6l5-6.85h-4.7v-3.68h10v2.63l-5 6.84zm15.08-9.43v13.16h-3.95V60.5a4.92 4.92 0 0 1-3.92 1.61c-3.45 0-6.3-3-6.3-7s2.84-6.95 6.3-6.95a4.92 4.92 0 0 1 3.92 1.6v-1.18zm-3.95 6.58a3.13 3.13 0 1 0-3.13 3.21 3 3 0 0 0 3.13-3.21zm25.65.8c0 4.05-3.15 6.16-6.7 6.16a6.6 6.6 0 0 1-6.45-4l3.64-2.1a2.65 2.65 0 0 0 2.81 2c1.74 0 2.5-.92 2.5-2.05s-.76-2.06-2.5-2.06h-.87l-1.6-2.4 3.34-4.24h-6.74v-4h11.85v3.42l-3.2 4.06a5.4 5.4 0 0 1 3.92 5.2zm1.6-3.42c0-5.7 2.74-9.6 7.5-9.6s7.5 3.9 7.5 9.6-2.73 9.58-7.5 9.58-7.5-3.9-7.5-9.58zm10.8 0c0-3.56-1.08-5.48-3.3-5.48s-3.3 1.96-3.3 5.48 1.08 5.48 3.3 5.48 3.3-1.93 3.3-5.48z" /><use xlink:href="#B" x="236.63" /><path d="M562.84 53.65v8.08h-4v-7.5a2.17 2.17 0 0 0-2.29-2.4c-1.45 0-2.45.84-2.45 2.7v7.2h-3.9V48.57h3.95v1.23a4.51 4.51 0 0 1 3.76-1.6c2.66 0 4.93 1.9 4.93 5.45zm2.3-8.65a2.37 2.37 0 1 1 2.37 2.37 2.39 2.39 0 0 1-2.37-2.37zm.4 3.53h3.94v13.2h-3.94zm6.57 11.07a2.51 2.51 0 1 1 2.5 2.5 2.52 2.52 0 0 1-2.5-2.5z" /></g><defs><path id="B" d="M310.67 43.3v18.43h-3.95V60.5a5 5 0 0 1-3.92 1.61c-3.45 0-6.3-3-6.3-7s2.84-6.95 6.3-6.95a4.94 4.94 0 0 1 3.92 1.6V43.3zm-3.95 11.85a3.13 3.13 0 1 0-3.13 3.21 3 3 0 0 0 3.13-3.21z" /></defs></svg>');document.querySelector('.paypo__open').addEventListener('click',function(){document.body.style.overflow='hidden',document.querySelector('.paypo__dialog').setAttribute('open',!0)}),document.querySelector('.paypo__dialog').addEventListener('click',function(){document.body.style.overflow='auto',document.querySelector('.paypo__dialog').removeAttribute('open')})});
}


/* ================================================================================================================
 * COUNT DOWN PROMOTION
 */

$(document).find('.core_countDownPromotion').each(function () {
  var self = $(this);
  var parseDataDate = function (time) {
    return String(time).split(' ').map(function (item) {
      return ['<span>' + item + '</span>'].join('')
    })
  }
  let counterShowCase = self.data('showcase') || self.data('showcasesecond') || 0
  let counterIndex = counterShowCase ? 1 : 0
  const productShipmentCounter = $('.core_countDownPromotion').parents('.product-shipment-counter').length >= 1

  if(self.data('countergroup') === 'tomorrow'){
    counterShowCase++
  }

  var data = {
    countdown: [self.data('countdown'), self.data('nextcountdown')],
    pattern: function (data) {
      return `
        ${!productShipmentCounter
          ? `<div>${data.days !== 'undefined' || data.days > 0 ? parseDataDate(data.days) : ''}</div><div>${data.days !== 'undefined' || data.days > 0 ? L.DAYS : ''}</div>`
          : `<div class='${data.days === 'undefined' || data.days <= 0 ? 'hidden' : ''}'> ${parseDataDate(data.days)} ${productShipmentCounter ? `<small>${L.DAYS.toLowerCase()}</small>` : ''} </div>
        `}
        <div> ${parseDataDate(data.hours)} ${productShipmentCounter ? `<small>${L.HOURS.toLowerCase().slice(0, -3).concat('.')}</small>` : ''} </div>
        <div> ${parseDataDate(data.minutes)} ${productShipmentCounter ? `<small>${L.MINUTES.toLowerCase().slice(0, -3).concat('.')}</small>` : ''}  </div>
        <div> ${parseDataDate(data.seconds)} ${productShipmentCounter ? `<small>${L.SECONDS.toLowerCase().slice(0, -4).concat('.')}</small>` : ''}</div>
      `
    },
    append: function (html) {
      self[0].innerHTML = html
    }
  };
  countdown.setLabels('|z|:|:|x||||||', '|z|:|:|x||||||', '', '', '');
  var setCountdownTimer = function (timer) {
    return countdownTimer = countdown(Big(Date.now()).plus(timer[counterIndex] * 1000), function (parse) {
      data.append(data.pattern({
        days: parse.days,
        hours: (parse.hours).pad(),
        minutes: (parse.minutes).pad(),
        seconds: (parse.seconds).pad()
      }));

      switch (counterShowCase) {
        case 1:
          self.parent().find('span').last().text(`${L.PRODUCT_SHIPMENT_COUNTER_TOMORROW}`)
          break;
        case 2:
          self.parent().find('span').last().text(`${L.PRODUCT_SHIPMENT_COUNTER_AFTER_TOMORROW}`)
          break;
        default:
          break
      }
      if (parse.days == 0 && parse.hours == 0 && parse.minutes == 0 && parse.seconds == 0) {
        window.clearInterval(countdownTimer)
        counterIndex++
        counterShowCase++
        timer = [timer[0], (timer[1] - timer[0] - 1)]
        if (productShipmentCounter && timer[counterIndex] > 0 && timer[counterIndex] !== undefined && timer[counterIndex] !== null) {
          setTimeout(() => {
            setCountdownTimer(timer)
          }, 1000)
        }
      }
    }, countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS)
  }
  if (data.countdown[0] > 0) {
    setCountdownTimer(data.countdown)
  }else if (productShipmentCounter && data.countdown[0] <= 0 && data.countdown[counterIndex] > 0) {
    setCountdownTimer(data.countdown)
  }
  else {
    data.append(data.pattern({days: 0, hours: (0).pad(), minutes: (0).pad(), seconds: (0).pad()}))
  }
});

let setSpacingToTableCell = function (tableElement) {
  if (!tableElement.hasAttribute('cellSpacing')) {
    return;
  }
  $(tableElement).css('border-spacing', tableElement.cellSpacing + 'px');
  $(tableElement).css('border-collapse', 'separate');
};

let setPaddingToTableCell = function (tableElement) {
  if (!tableElement.hasAttribute('cellPadding')) {
    return;
  }
  $(tableElement).find('td').css('padding', tableElement.cellPadding + 'px');
};

$(document).on('ready', function () {
  let tables = $('section.product-tabs .tab[data-tab="description"] .tab-content table');
  if (tables.length) {
    tables.each(function (index, item) {
      setPaddingToTableCell(item);
      setSpacingToTableCell(item);
    });
  }
})

/* ================================================================================================================
 * STICKY HEADER
 */

$(document).on('ready', function (e){

  var headerNav = $('#header').height()
  if($('#sticky-header').find('.sticky-header_content__logo').height() > 120 ) {
    $('.sticky-header_content__logo img').css({maxWidth: '90px'})
  }

  $('.sticky-header_content__menu_list').children().children().each(function(index, item){
    if($(item).prop('tagName') === 'A' && $(item).attr('href') === '#'){
      $(this).on('click', function (e){
        e.preventDefault()
      })
    }
  })

  $(document).on('scroll', function(){
    var windowTopPosition = $(window).scrollTop()
    if($('#sticky-header').data('sticky') === 'yes' && ( windowTopPosition - 100) > headerNav && $(window).width() > 768){
      $('#sticky-header').addClass('active')
      $('#header').addClass('sticky-active')
      $('main').css({paddingTop: headerNav})
    }else{
        $('#sticky-header').removeClass('active')
        $('#header').removeClass('sticky-active')
        $('main').css({paddingTop: 0})
      }
    if ($('#sticky-header').data('sticky') === 'yes' && windowTopPosition <= (headerNav + 300)){
      $('#sticky-header').removeClass('active')
    }
  })

})

/* ================================================================================================================
 * INSTAGRAM
 */

$(document).on('ready', function (e){
  if($('.instagram-modul').length) {
    $.ajax({
      url: '/instagram?action=getIGMedia&json=1',
      success: function (response) {
        if (response.success == true) {
          renderInstagram(response.data)
        } else {
          $('.instagram-modul').remove()
        }
      }
    });

    var renderInstagram = function (posts) {
      Object.keys($('.instagram-modul').data()).forEach(function(key){
        switch (key){
          case 'imgdescr' :
            $('.instagram-modul').find($('.inst_descr')).remove()
                break;
            case 'likes' :
            $('.instagram-modul').find($('.inst_likes')).remove()
                break;
            case 'comments' :
            $('.instagram-modul').find($('.inst_comments')).remove()
                break;
          case 'imgdescr' && 'likes' && 'comments' :
            $('.instagram-modul').find($('.instagram_info')).remove()
                break;
        }
      })

      $('.instagram-modul-col').addClass('hidden')
      var lastPostIndex = posts.length
      var maxPostsCount = $('.instagram_post').length

      if (lastPostIndex > maxPostsCount) {
        posts = posts.slice(0, maxPostsCount)
      }

      posts.forEach(function (post, index) {
        $('.instagram_post').find($('.instagram_info')).removeClass('hidden')
        $('.instagram_post').find($('.search-loading')).addClass('hidden')
        var template = $('.instagram_post')[index].outerHTML

        template = template.replace(/{{:likes:}}/g, post.like_count)
        template = template.replace(/{{:comments:}}/g, post.comments_count)
        if (post.caption) {
          template = template.replace(/{{:caption:}}/g, post.caption)
        }else{
          template = template.replace(/{{:caption:}}/g, '')
        }

        switch (post.media_type) {
          case "IMAGE" :
            template = template.replace('/view/new/img/transparent.png', post.media_url)
            template = template.replace(/{{:media_type:}}/g, '')
            break;
          case "VIDEO" :
            template = template.replace('/view/new/img/transparent.png', post.thumbnail_url)
            template = template.replace('/view/new/img/transparent.png', '/view/new/img/ico_instagramm/play.png')
            break;
          case "CAROUSEL_ALBUM" :
            template = template.replace('/view/new/img/transparent.png', post.media_url)
            template = template.replace('/view/new/img/transparent.png', '/view/new/img/ico_instagramm/copy.png')
            break;
        }

        $('.instagram-modul-col').eq(index).html(template)
        $('.instagram-modul-col').eq(index).removeClass('hidden')
        $('.instagram-modul-col').eq(index).on('click', function(){
          instagramPostPopup(post, $(this), e)
        })
      })
      $('.instagram-modul-col.hidden').remove()
      renderInstagramCarousel();
    }

    var renderInstagramCarousel = function () {
      var checkWidth = $(window).width();
      var instagramPost = $('.instagram-modul').find($('.instagram-modul-row'));

      if (checkWidth > 800) {
        if (instagramPost.data('owlCarousel') !== undefined){
            instagramPost.data('owlCarousel').destroy();
            instagramPost.removeClass('owl-carousel owl-theme owl-loaded');
            instagramPost.find('.owl-stage-outer').children().unwrap();
            instagramPost.removeData();
          }
        }
      else if (checkWidth < 800) {
        if (instagramPost.data('owlCarousel') !== undefined) {
          instagramPost.data('owlCarousel').destroy();
          instagramPost.removeClass('owl-carousel owl-theme owl-loaded');
          instagramPost.find('.owl-stage-outer').children().unwrap();
          instagramPost.removeData();
          instagramPost.addClass('owl-carousel owl-theme owl-loaded');
          instagramPost.owlCarousel({
            touchDrag: true,
            mouseDrag: true,
            autoplay: true,
            loop: true,
            autoplaySpeed: 3000,
            autoplayTimeout: 3000,
            responsive: {
              0: {
                items: 1
              },
              450: {
                items: 2
              },
              649: {
                items: 3
              },
            }
          });
        }else{
          instagramPost.owlCarousel({
            touchDrag: true,
            mouseDrag: true,
            autoplay: true,
            loop: true,
            autoplaySpeed: 3000,
            autoplayTimeout: 3000,
            responsive: {
              0: {
                items: 1
              },
              450: {
                items: 2
              },
              649: {
                items: 3
              },
            }
          });
        }
      }
    }
    $(window).resize(renderInstagramCarousel);


    var instagramPostPopup = function (postPopup, item, event){

      let instagramPostMediaTemplate = ''

      switch (postPopup.media_type) {
        case 'VIDEO' :
          instagramPostMediaTemplate =
            `
            ${postPopup.media_url !== undefined && postPopup.media_url !== null
            ? `
              <i class="fa fa-play" aria-hidden="true"></i>
              <video>
                <source src="${postPopup.media_url}" type="video/mp4" >
              </video>` 
            : `<img src="${postPopup.thumbnail_url}">`
          }`
       
          break;
        case 'CAROUSEL_ALBUM':
          postPopup.children.data.length
               postPopup.children.data.length !== 0 && postPopup.children.data.map(item => {
                 instagramPostMediaTemplate += `
                    ${item.media_type === 'VIDEO' && item.media_url
                    ? `<div class="instagram_video_wrapper">
                            <i class="fa fa-play" aria-hidden="true"></i>
                            <video>
                              <source src="${item.media_url}" type="video/mp4" >
                            </video>
                         </div>`
                    : `<img src="${item?.media_url || item?.thumbnail_url  || postPopup.media_url}">`
                    }`
                })
              break;
        case 'IMAGE' :
          instagramPostMediaTemplate = `<img src="${postPopup.media_url}" alt="">`
          break;
        default:
          instagramPostMediaTemplate = `<img src="${item?.media_url || item?.thumbnail_url  || postPopup.media_url}">`
          break;
      }

      var instagramPopup = `
            <div class="instagram_popup_container">
              <div class="instagram_popup_overlay">
                <div class="instagram_popup">
                    <div class="instagram_popup_img">
                        ${instagramPostMediaTemplate}
                        </div>
                        <div class="instagram_popup_info">
                            <div class="post_auth_name">
                                <img src=${postPopup.owner.profile_picture_url} alt="">
                                <span>${postPopup.username}</span>
                            </div>
                        <div class="post_descr"> 
           
                            ${postPopup.caption ? `<p>${postPopup.caption.length > 400 ? postPopup.caption.substring(0, 397) + '... <br> <span class="more_caption"> '+L['MORE']+'</span>' : postPopup.caption}</p>` : '' }
              
                            <div class="post_additional_info">
                              <span><img src="/view/new/img/ico_instagramm/ic-favorites-empty.svg" alt="likes">${postPopup.like_count}</span>
                              <span><img src="/view/new/img/ico_instagramm/ic-comments-empty.svg" alt="comments">${postPopup.comments_count}</span>
                              <span>${new Date(postPopup.timestamp).getDay() + ' ' + new Date(postPopup.timestamp).toLocaleString($('html').attr('lang'), { month: "long" })}</span>
                            </div>
                        </div>
                        <div class="post_permalink">
                          <a href='${postPopup.permalink}'>Zobacz na Instagramie</a>
                        </div>
                    </div>
                    <button class="instagram_popup_close">
                        <img src="/view/new/img/ico_instagramm/close.svg" alt="">       
                    </button>
                </div>
              </div>
            </div>
        `

      $('.skyshop-container').append(instagramPopup)

      if($('.instagram_popup_img').find('img').width() >= 480 && $('.instagram_popup_img').find('img').width() <= 490){
        $('.instagram_popup').css({maxWidth: '800px'})
        $('.instagram_popup_img').addClass('thin_carousel')
      }

      if($('.instagram_popup_img').find('img').height() >= 450 && $('.instagram_popup_img').find('img').width() >= 600 ){
        $('.instagram_popup_img').addClass('square_carousel')
      }

      setTimeout(function (){
        if($('.instagram_popup_img').find($('.instagram_video_wrapper')).height() > 650){
          $('.instagram_popup').css({maxWidth: '800px'})
          $('.instagram_popup_img').addClass('thin_carousel')
        }

        if($('.instagram_popup_img').find($('.instagram_video_wrapper')).height() < 610 &&
            $('.instagram_popup_img').find($('.instagram_video_wrapper')).height() > 500 &&
            $('.instagram_popup_img').find($('.instagram_video_wrapper')).width() >= 600) {
          $('.instagram_popup_img').addClass('square_carousel')
        }
      },500)

      $('.more_caption').click(function(e){
         $(this).closest('.post_descr p').text(postPopup.caption);
         $('.post_descr p ').scrollbar()
      })

        if($(window).width() < 600){
          $('.more_caption').remove()
          $('.post_descr p').text(postPopup.caption);
        }

      if($('html').hasClass('touch')){
        $('html').css({overflow: 'hidden'})
      }else{
        $('body').css({overflow: 'hidden'})
      }

      $('.instagram_popup_container').click( function (e){
        if(e.target.className === 'instagram_popup_overlay'){
          $('.instagram_popup_container').remove()
          $('body').css({overflow: 'auto'})
          if($('html').hasClass('touch')){
            $('html').css({overflow: 'auto'})
          }
        }
      })

      $('.instagram_popup_close').on('click', function(e){
        $('.instagram_popup_container').remove()
        $('body').css({overflow: 'auto'})
        if($('html').hasClass('touch')){
          $('html').css({overflow: 'auto'})
        }
      })

      $('.instagram_popup_img').find('video').on('click', function(){
        this.paused ? (this.play(), $('.fa-play').addClass('hidden')) : (this.pause(), $('.fa-play').removeClass('hidden'))
      })

      $('.fa-play').on('click', function(){
         $(this).parent().find('video').trigger('play')
        $(this).addClass('hidden')
      })

      if(postPopup.media_type === "CAROUSEL_ALBUM"){
        $('.instagram_popup_img').addClass('instagram_carousel').owlCarousel({
          onTranslated: function(e) {
            $('.instagram_popup_img').find('video').trigger('pause')
          },
          touchDrag: false,
          mouseDrag: false,
          dots: false,
          items: 1,
          nav: true,
          navText: ['<img src="/view/new/img/ico_instagramm/ic-arrow.png">','<img src="/view/new/img/ico_instagramm/ic-arrow.png">'],
        });
      }


    }
  }
})



/* ================================================================================================================
 * ORDER PROFILE OPTIONS
 */
$(document).on('click','.core_accountOptions',function(e){

  var orderOptions = $('.order').find('[data-profile-option]')

  if($('[data-not-logged]').length){
    $('[data-not-logged]').each(function (){
      $(this).removeClass('hidden')
    })
  }

  switch ($(this).data('profile-option')) {
    case 'no_register' :
      [$('input[name="password"]'),$('input[name="password_retype"]')].forEach(function (item){
        $(item).parent().addClass('hidden')
        $(item).data('valid', '')
      })

      $('input[name="user_email"]').parent().removeClass('hidden')
      $('input[name="user_email"]').data('valid', 'required|email')

        $('.order_login').find('[name="order-email"]').data('valid', '')
        $('.order_login').find('[name="order-password"]').data('valid', '')
        $('.order_login').find('#order-login-btn').data('valid', '')
      break;
    case 'register' :
      [$('input[name="user_email"]'),$('input[name="password"]'),$('input[name="password_retype"]')].forEach(function (item){
        $(item).parent().removeClass('hidden')
        $('input[name="user_email"]').data('valid', 'required|email')
        $('input[name="password"]').data('valid', 'required|minlength:4|maxlength:32|equal:password_retype')
        $('input[name="password_retype"]').data('valid', 'required|minlength:4|maxlength:32|equal:password')
      })
        $('.order_login').find('[name="order-email"]').data('valid', '')
        $('.order_login').find('[name="order-password"]').data('valid', '')
        $('.order_login').find('#order-login-btn').data('valid', '')

      break;
    case 'have_registered' :
      [$('input[name="user_email"]'),$('input[name="password"]'),$('input[name="password_retype"]')].forEach(function (item){
        $(item).parent().addClass('hidden')
        $(item).data('valid', '')
      })
      $('.order_login').find('[name="order-email"]').data('valid', 'required')
      $('.order_login').find('[name="order-password"]').data('valid', 'required|minlength:4|maxlength:32')
      $('.order_login').find('#order-login-btn').data('valid', 'login-option')
      if($('[data-not-logged]').length){
        $('[data-not-logged]').each(function (){
          $(this).addClass('hidden')
        })
      }
      break;
  }

  if($('.order').find('[data-profile-option="have_registered"]').hasClass('active')){
    removeError($('.order').find('[data-profile-option="have_registered"]').next().find('.ss-error'))
  }

  if(orderOptions.parents('.ss-error').eq(0).length > 0){
    removeError(orderOptions.parents('.ss-error').eq(0));
  }

  if($('.order').find($('div[data-not-logged]').find('input.ss-error')).length > 0){
    removeError($('.order').find($('div[data-not-logged]')).find('.ss-error'))
  }

})


/* ================================================================================================================
 * ORDER PAGE SUB PRODUCTS
 */

$(document).on('click','.core_orderShowAllProducts',function(e) {
  e.preventDefault()
  var productParentId = $(this).closest('[data-product-id]').data('product-id')


  if($(this).hasClass('hide-text')){
    $(this).text(L.SUB_PRODUCTS_SHOW_CART)
    $('[data-parent-product-id="' + productParentId + '"]').css({display: 'none'})
    $(this).removeClass('hide-text')
    $(this).closest('[data-product-id]').removeClass('open')
  }else{
    $('[data-parent-product-id="' + productParentId + '"]').css({display: 'table-row'})
    $(this).text(L.SUB_PRODUCTS_HIDE_CART)
    $(this).closest('[data-product-id]').addClass('open')
    $(this).addClass('hide-text')
    if($(window).width() <= 766) {
      $('.order_sub_product:not(".sub_products_wrapper .order_sub_product")').css({display: 'none'})
      $(this).parent().find('.sub_products_wrapper').removeClass('hidden')
    }
  }
})

$(document).on('ready', function(e) {
  $('[data-product-id]:not([data-parent-product-id])').each(function(i, el){
    if($(el).hasClass('order_parent_product')){
      $('[data-parent-product-id='+$(this).data('product-id')+']').clone().appendTo($(el).find('.sub_products_wrapper'))
      $('.sub_products_wrapper').find('.order_sub_product').addClass('rwd_sub_product')
    }
    $(el).find('.sub_products_wrapper').children('.rwd_sub_product').each(function(i, ele){
      $(ele).find('.product-name').attr('data-translate', ++i + '.')
    })
    $(el).attr('data-translate',  L.PRODUCT +' #' + ++i)
  })

})
