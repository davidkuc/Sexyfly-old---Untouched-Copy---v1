$('.order-country').select2({
  theme: 'bootstrap',
  width: '100%',
  minimumResultsForSearch: 3,
  escapeMarkup: function(markup){
    return markup;
  },
  templateSelection: function(result){
    if(typeof result.id === 'undefined'){
      return result.text;
    }

    return [
      '<div class="order-country-item">',
        '<div class="order-country-item-logo">',
          '<img src="/view/new/img/ico_flags/' + result.id.toLowerCase() + '.png" />',
        '</div>',
        '<div class="order-country-item-name">',
          '<div class="order-country-item-name-wrapper">',
            '<span data-country="' + result.id + '" data-ue="' + result.element.dataset.ue +'">' + result.text + '</span>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  },
  templateResult: function(result){
    if(typeof result.id === 'undefined'){
      return result.text;
    }

    return [
      '<div class="order-country-item">',
        '<div class="order-country-item-logo">',
          '<img src="/view/new/img/ico_flags/' + result.id.toLowerCase() + '.png" />',
        '</div>',
        '<div class="order-country-item-name">',
          '<div class="order-country-item-name-wrapper">',
            '<span data-country="' + result.id + '" data-ue="' + result.element.dataset.ue +'">' + result.text + '</span>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }
}).on('select2:open',function(){
  $('.select2-results > ul').scrollbar();

}).on('select2:closing',function(){
  $('.select2-results > ul').scrollbar('destroy');
});

if($("input[name='dotpay_rules_agreed']")){
  var dotpayCheckboxes = $("input[name='dotpay_rules_agreed']").closest('.col-xs-12');
  dotpayCheckboxes.remove();
}
$('.order-select-table').on('click','tr:not(.more) > td',function(e){
  var self = $(this).parents('tr'),
      more = self.next(),
      parents = self.parents('table'),
      actives = parents.find('tr.active'),
      mores = parents.find('tr.more.open'),
      checkbox = self.find('input[type="checkbox"],input[type="radio"]');
    
  var paymentId =  $(this).parents('tr').data('payment-id'),
      orderCheckboxes = $("input[name='register_must_accept']").closest('.col-xs-12');

  if($(this).parent().hasClass('core_getOrderShipments')){      
    if(paymentId == 10){
      orderCheckboxes.after(dotpayCheckboxes);
    }else{
      if(dotpayCheckboxes != undefined ){
        dotpayCheckboxes.remove();
      }
    }
  }

  if(!self.hasClass('active')){
    actives.removeClass('active');
    mores.removeClass('open');
    mores.velocity('fadeOut',{
      duration: 200
    });
    actives.find('input[type="checkbox"],input[type="radio"]').prop('checked',false);
    self.addClass('active');
    checkbox.prop('checked',true);
    if(more.hasClass('more')){
      more.addClass('open');
      more.velocity('fadeIn',{
        duration: 200
      });
    }
  }else{
    e.stopPropagation();
  }
});

$('#param-vat').on('change',function(){
  var self = $(this),
      container = $('.param-vat-container');

  if(self.prop('checked')){
    container.velocity('slideDown',{ duration: 200 });
  }else{
    container.velocity('slideUp',{ duration: 200 });
  }
});

$('#param-account').on('change',function(){
  var self = $(this),
      container = $('.param-account-container');

  if(self.prop('checked')){
    container.velocity('slideDown',{ duration: 200 });
  }else{
    container.velocity('slideUp',{ duration: 200 });
  }
});

$('#bill-vat-exists').on('change', function() {
  var billVatField = $('#user-bill-vat');

  if ($(this).prop('checked')) {
    billVatField.prop('disabled', true);
    removeError(billVatField);
    billVatField.val('');
  } else
    billVatField.prop('disabled', false);

});

var checkWdtShowCheckbox = function() {
  var selectedDeliveryCountry = $('.user_country').find(':selected').val()
  var selectedDeliveryCountryUE = $('.user_country').find(':selected').data('ue')
  var selectedCountryUE = $('.user_bill_country').find(':selected').data('ue') // check ue invoice
  var selectedCountryInvoice = $('.user_bill_country').find(':selected').val() // select country

  if(selectedCountryUE == 1 && selectedDeliveryCountryUE == 1 && S.SHOP.country != selectedCountryInvoice && S.SHOP.country != selectedDeliveryCountry && $("#param-vat").is(':checked')) {
    $("#param-wdt").show();
  } else {
    $("#param-wdt").hide();
    $("#param-rules-wdt").prop( "checked", false );
    SkyShop.order.wdt = false;
  }

  if ($('#bill-vat-exists').prop('checked')) { // no tax
    $("#param-wdt .checkbox-field").addClass("field-disabled");
    $("#param-wdt").tooltip()
  } else {
    $("#param-wdt .checkbox-field").removeClass("field-disabled");
    $("#param-wdt").tooltip('destroy')
  }

  if ($('#param-rules-wdt').prop('checked')) { //wdt
    if(selectedCountryUE == 1 && selectedDeliveryCountryUE == 1 && S.SHOP.country != selectedCountryInvoice && S.SHOP.country != selectedDeliveryCountry && $("#param-vat").is(':checked')) {
      $('#user-bill-iso').val(selectedCountryInvoice)
      $("#user-bill-iso").show();
    } else {
      $("#user-bill-iso").hide();
    }
    $("#bill-vat-exists-container label").addClass("field-disabled");
    $('#bill-vat-exists-container').tooltip()
  } else {
    $("#user-bill-iso").hide();
    $("#bill-vat-exists-container label").removeClass("field-disabled");
    $("#bill-vat-exists-container").tooltip('destroy')
  }
}

$('#bill-vat-exists').on('click', function () { // no tax
  checkWdtShowCheckbox()
  orderCalculate();
})
$('#param-rules-wdt').on('click', function () { // checkbox wdt
  checkWdtShowCheckbox()
  orderCalculate();
  window.dispatchEvent(new Event('resize'))
})
$('.user_bill_country').on('change', function() { // country invoice
  checkWdtShowCheckbox()
  $('#user-bill-vat').data('country', $('.user_bill_country').find(':selected').val())
  orderCalculate();
  window.dispatchEvent(new Event('resize'))
})
$('.user_country').on('change', function() { // country invoice
  checkWdtShowCheckbox();
  orderCalculate();
})
$('#param-vat').on('change' ,function(){ // checkbox invoice
  checkWdtShowCheckbox();
  $('#user-bill-vat').data('country', $('.user_bill_country').find(':selected').val())
  orderCalculate();
});


$('#user-receipt-vat-checkbox').on('change', function() {
  var userReceiptField = $('#user-receipt-vat-input');

  if ($(this).prop('checked')) {
    userReceiptField.prop('disabled', false);
  } else {
    userReceiptField.prop('disabled', true);
    userReceiptField.val('');
  }
});

$( window ).on( "load", function() {
  var stateOfCheckbox = $('#user-receipt-vat-checkbox').prop('checked');
  var userReceiptVatInput = $('#user-receipt-vat-input');

  if (stateOfCheckbox) {
    userReceiptVatInput.prop('disabled', false);

  } else {
    userReceiptVatInput.prop('disabled', true);
    userReceiptVatInput.val('');
  }

  checkWdtShowCheckbox();
  $('#user-bill-vat').data('country', $('.user_bill_country').find(':selected').val())
});