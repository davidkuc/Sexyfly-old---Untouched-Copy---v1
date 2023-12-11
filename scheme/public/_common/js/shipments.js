let getSpecialFunctionMethods = async function (specialFunction, cod, country) {
  let methods = [];
  try {
    await $.ajax({
      method: 'GET',
      url: `/order/?json=1&action=loadSpecialFunctionCities&country=${country}&function=${specialFunction}&cod=` + (cod === 'yes' ? 1 : 0),
    }).done(function (data) {
      if (Array.isArray(data)) {
        methods = data;
      } else if (typeof data === 'object') {
        methods = Object.keys(data).map((key) => data[key])
      }
      $('.shipment-loader').removeClass('loading');
      $('.delivery-method-select').show();
    });
  } catch (error) {
    console.log('Error occurred');
    console.log(error);

    swal({
      width: 1000,
      confirmButtonText: 'OK',
      confirmButtonClass: 'btn',
      title: L['ERROR_UNEXPECTED_ERROR'],
      html: '<div><div class="row" style="padding: 40px;">' + L['ERROR_CRITICAL_MESSAGE'] + '</div></div>'
    })
  }

  return methods;
};

let loadFunctionMethods = async function (specialFunction, cod, country) {
    if (!SkyShop.shipment.specialFunctionMethods.hasOwnProperty(specialFunction)) {
        SkyShop.shipment.specialFunctionMethods[specialFunction] = {};
    }
    if (!SkyShop.shipment.specialFunctionMethods[specialFunction].hasOwnProperty(cod)) {
        SkyShop.shipment.specialFunctionMethods[specialFunction][cod] = {};
    }
    SkyShop.shipment.specialFunctionMethods[specialFunction][cod][country] = await getSpecialFunctionMethods(specialFunction, cod, country);
};

let hasLoadedFunctionMethods = (specialFunction, cod, country, container) => {
  if (SkyShop.shipment.specialFunctionMethods.hasOwnProperty(specialFunction) && SkyShop.shipment.specialFunctionMethods[specialFunction].hasOwnProperty(cod) && country.length && SkyShop.shipment.specialFunctionMethods[specialFunction][cod].hasOwnProperty(country) && SkyShop.shipment.specialFunctionMethods[specialFunction][cod][country].length > 0){
    return true
  }else{
    $('.delivery-method-select').hide()
    $(container).children().append('<div class="shipment-loader loading "><div class="loader"></div></div>')
  }
}

let loadShipmentMethods = async function (key, container) {
  let shipment = SkyShop.order.shipments[key];
  let specialFunction = shipment['function'];
  let cod = shipment['pay_delivery'];
  let country = SkyShop.order.userCountry;

  let hasShipmentSpecialFunction = () => (shipment.hasOwnProperty('function') && shipment.function !== 'none');

  if (!hasShipmentSpecialFunction()) {
    return;
  }

  if (!hasLoadedFunctionMethods(specialFunction, cod, country, container)) {
    await loadFunctionMethods(specialFunction, cod, country);
  }
  shipment['methods'] = SkyShop.shipment.specialFunctionMethods[specialFunction][cod][country];
}

var orderShipments = function(key){

  var shipment = SkyShop.order.shipments[key];
  var trans = {
    city: L['USER_CITY'],
    street: L['USER_STREET2']
  };
  var type = 'default',
      additionalOrderOption = null;
  var data = {
    cities: {},
  };

  var template = {
    render: [
        '<div class="delivery-method-select">',
      '<span class="order-title-section">{{:city:}}</span>',
      '<div cy-data="orderDeliverySelectCity" data-valid-box>',
        '<select  class="order-country core_orderShipmentSelect" data-key="{{:key:}}" data-type="{{:type:}}" data-valid="orderShipmentSelect">',
          '{{:options_city:}}',
        '</select>',
      '</div>',
      '<span class="order-title-section">{{:street:}}</span>',
      '<div class="shipment-loader loading hidden" ><div class="loader"></div></div>',
      '<div cy-data="orderDeliverySelectStreet" data-valid-box class="">',
        '<select class="order-country core_orderShipmentSelectStreet " data-streets="{{:key:}}" data-valid="orderShipmentSelect">',
          '{{:options_streets:}}',
        '</select>',
      '</div>',
      '<div class="hidden">',
        '<input type="hidden" name="shipment_method[{{:key:}}]" />',
      '</div>',
      '{{:additional_order_option:}}',
        '</div>'
    ].join(''),
    option: [
      '<option value="{{:value:}}">{{:name:}}</option>'
    ].join('')
  };

  var storeCountries = function(store){
    store.forEach(function(item){
      var city = $.base64Encode(item);

      if(typeof data.cities[city] === 'undefined'){
        data.cities[city] = item;
      }

    });

    SkyShop.order.shipmentsParsed[key] = {
      cities: data.cities,
      streets: {}
    };
  };

  var setTrans = function(set){
    let transCase = []

    switch(set){
      case 'paczkomaty':
        transCase= ['street|Paczkomat']
        break;
      // case 'paczka_w_ruchu':
      //   transCase =['street|Kiosk'];
      //  break;
      // case 'dhl_pop':
      //   transCase =['street|Kiosk'];
      //   break;
      // case 'gls_fast_parcel':
      //   transCase  = ['street|Kiosk'];
      //   break;
      // case 'dpd_pickup':
      //   transCase = ['street|Kiosk'];
      //   break;
      // case 'odbior_w_punkcie':
      //   transCase = ['street|Punkt odbioru'];
      //   break;
      default:
        transCase = ['street|Punkt odbioru'];
        break;
    };

    transCase.forEach(function(option){
      var optionKey = option.split('|');
      trans[optionKey[0]] = optionKey[1];
    });
  };

  /* ================================================================================================================
   * CUSTOM OPTIONS FOR SPECIFIC SHIPMENTS METHODS
   */

  if(typeof SkyShop.order.shipmentsParsed[key] === 'undefined'){
    switch(shipment['function']){
      case 'paczkomaty':
        storeCountries(shipment['methods']);
      break;
      case 'paczka_w_ruchu':

        storeCountries(Object.keys(shipment['methods']).map(function(key){ return shipment['methods'][key]; }));
      break;
      case 'dhl_pop':
        storeCountries(Object.keys(shipment['methods']).map(function(key){ return shipment['methods'][key]; }));
      break;
      case 'gls_fast_parcel':
        storeCountries(Object.keys(shipment['methods']).map(function(key){ return shipment['methods'][key]; }));
        break;
      case 'dpd_pickup':
        storeCountries(Object.keys(shipment['methods']).map(function(key){ return shipment['methods'][key]; }));
        break;
      case 'odbior_w_punkcie':
        storeCountries(Object.keys(shipment['methods']).map(function(key){ return shipment['methods'][key]; }));
      break;
    };
    setTrans(shipment['function'])
  } else {
      // refresh country
      switch (shipment['function']) {
          case 'gls_fast_parcel':
            storeCountries(Object.keys(shipment['methods']).map(function (key) {
                  return shipment['methods'][key];
              }));
              break;
      }
    setTrans(shipment['function'])
  }
  switch(shipment['function']){
    case 'paczkomaty':
        if (typeof SkyShop.inpostDisplayLinkToMap !== 'undefined' && SkyShop.inpostDisplayLinkToMap && typeof SkyShop.inpostDisplayLinkToMapOnMobile !== 'undefined') {
            let hideOnMobileClass = SkyShop.inpostDisplayLinkToMapOnMobile ? '' : 'hidden-on-mobile';
            additionalOrderOption = [
              `<span class="order-title-section ${hideOnMobileClass}">`,
                '<a href="#" class="core_orderOpenMapPaczkomaty">',
                  L['SELECT_PARCEL_LOCKER_MAP'],
                '</a>',
              '</span>'
            ];
        }
        break;
    case 'dhl_pop':
        if (typeof SkyShop.dhlPopDisplayLinkToMap !== 'undefined' && SkyShop.dhlPopDisplayLinkToMap) {
            additionalOrderOption = [
              '<span class="order-title-section hidden-on-mobile ">',
                '<a href="#" class="core_orderOpenMapDhlPop">',
                  L['SELECT_POINT_MAP'],
                '</a>',
              '</span>'
            ];
        }
        break;
    case 'dpd_pickup':
      if (SkyShop.hasOwnProperty('dpdDisplayLinkToMap') && SkyShop.dpdDisplayLinkToMap) {
        let hideOnMobileClass = SkyShop.dpdDisplayLinkToMapOnMobile ? '' : 'hidden-on-mobile';
        additionalOrderOption = [
          `<span class="order-title-section ${hideOnMobileClass}">`,
          '<a href="#" class="core_orderOpenMapDpdPickup">',
          L['SELECT_POINT_MAP'],
          '</a>',
          '</span>'
        ];
      }
      break;
    case 'gls_fast_parcel':
      if (SkyShop.hasOwnProperty('glsDisplayLinkToMap') && SkyShop.glsDisplayLinkToMap) {
        additionalOrderOption = [
          `<span class="order-title-section">`,
          '<a href="#" class="core_orderOpenMapGls">',
          L['SELECT_POINT_MAP'],
          '</a>',
          '</span>'
        ];
      }
      break;
  }

  type = shipment['function'];

  /* ================================================================================================================
   * CREATE HTML
   */

  template.render = template.render.replace(/{{:key:}}/g,key);
  template.render = template.render.replace(/{{:type:}}/g,type);
  template.render = template.render.replace(/{{:city:}}/g,trans.city);
  template.render = template.render.replace(/{{:street:}}/g,trans.street);
  if(additionalOrderOption == null){
    template.render = template.render.replace(/{{:additional_order_option:}}/g,'');
  }else{
    template.render = template.render.replace(/{{:additional_order_option:}}/g,additionalOrderOption.join(''));
  }

  var cities = SkyShop.order.shipmentsParsed[key].cities;

  var renderOptions = {
    cities: template.option
  };

  renderOptions.cities = renderOptions.cities.replace(/{{:value:}}/g,'');
  renderOptions.cities = renderOptions.cities.replace(/{{:name:}}/g,'');

  for(var itemCity in cities){
    var item = {
      value: itemCity,
      name: cities[itemCity]
    }

    var option = template.option;
        option = option.replace(/{{:value:}}/g,item.name);
        option = option.replace(/{{:name:}}/g,item.name);

    renderOptions['cities'] += option;
  }

  template.render = template.render.replace(/{{:options_city:}}/g,renderOptions['cities']);
  return $(template.render);
};

var getShipmentsData = function (key) {
  return SkyShop.order.shipments[key] ?? [];
}

var getDhlMapByPointType = function (pointType) {
  if (pointType == 'LU') {
    return 'https://parcelshop.dhl.pl/mapa?options_pickup_cod=N&show_on_map_parcelshop=T&show_on_map_parcelstation=N&show_on_map_pok=T';
  } else if (pointType == 'AP') {
    return 'https://parcelshop.dhl.pl/mapa?options_pickup_cod=N&show_on_map_parcelshop=N&show_on_map_parcelstation=T&show_on_map_pok=N';
  }

  return 'https://parcelshop.dhl.pl/mapa';
}

var showHideStreetSelect = function (type) {
  switch (type) {
    case 'show':
      $('.shipment-loader').addClass('hidden')
      $('.core_orderShipmentSelectStreet').parent().removeClass('hidden')
      break;
    case 'hide':
      $('.shipment-loader').removeClass('hidden')
      $('.core_orderShipmentSelectStreet').parent().addClass('hidden')
      break;
  }
}

var orderShipmentsStreets = function(key,type,pickedCity,callback){

  const city = $.base64Encode(pickedCity);
  const data = {
    streets: {}
  }
  const cod = (SkyShop.order.shipments[key]?.pay_delivery ?? 'no') === 'yes' ? 1 : 0;
  var storeStreets = function (streets, keyStreets, pickedCity) {
    Object.entries(streets).forEach(function (item) {
      var streetData = {}
      if (typeof data.streets[pickedCity] === 'undefined') {
        data.streets[pickedCity] = []
      }
      keyStreets.forEach(function (option) {

        var optionKey = option.split('|');
        streetData[optionKey[0]] = item[1][optionKey[1]]
      });
      data.streets[pickedCity].push(streetData)

    })
    SkyShop.order.shipmentsParsed[key].streets = {
      ...SkyShop.order.shipmentsParsed[key].streets,
      ...data.streets
    }
    renderStreetsOptions()
  }

  var renderStreetsOptions = function() {

    var streets = SkyShop.order.shipmentsParsed[key].streets[city];
        // payDelivery = SkyShop.order.shipments[SkyShop.order.shipmentSelected].pay_delivery !== 'no';


    // NIE DOSTAJEMY ZWROTKI W OBJEKCIE Z PACZKOMATAMI 'cashOnDelievry'

    // if(streets && payDelivery && ['odbior_w_punkcie'].indexOf(type) == -1){
    //   var allowedStreets = [];
    //
    //   streets.forEach(function(street){
    //     if(typeof street.cashOnDelivery !== 'undefined' && (street.cashOnDelivery == 1 || street.cashOnDelivery == 'true')){
    //       allowedStreets.push(street);
    //     }
    //   });
    //
    //   streets = allowedStreets;
    // }

    var template = {
      render: '',
      option: [
        '<option value="{{:value:}}" data-options="{{:options:}}" >{{:name:}}</option>'
      ].join('')
    };

    var renderOptions = {
      streets: template.option
    };

    renderOptions.streets = renderOptions.streets.replace(/{{:value:}}/g,'');
    renderOptions.streets = renderOptions.streets.replace(/{{:options:}}/g,'');
    renderOptions.streets = renderOptions.streets.replace(/{{:name:}}/g,'-- ' + L['SELECT'] + ' --');

    if(streets !== undefined){
      streets.sort(function(a,b){
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      }); }

    for(var itemStreet in streets){
      var item = SkyShop.order.shipmentsParsed[key].streets[city][itemStreet];

      var options = [];

      Object.keys(item).forEach(function(i){
        if(i != 'id' || i != 'number'){
          options.push(i);
          options.push(':');
          options.push(item[i]);
          options.push('|');
        }
      });

      options = options.join('');
      options = options.substring(0,options.length - 1);
      var option = template.option;
      option = option.replace(/{{:value:}}/g,item.id);
      option = option.replace(/{{:options:}}/g,options);
      option = option.replace(/{{:name:}}/g,item.name);
      if((cookies.read('ac_ship' + key + '_method') != null && cookies.read('ac_ship' + key + '_method') == item.id) || (item.id === SkyShop.order.shipmentStreetPickedFromMap)){
        option = option.replace(/{{:selected:}}/g,'selected');
      }else{
        option = option.replace(/{{:selected:}}/g,'');
      }
      renderOptions['streets'] += option;
    }

    showHideStreetSelect('show')

    template.render = renderOptions['streets'];

    $('[data-streets="' + key + '"]').html(template.render);

    if(SkyShop.order.shipmentStreetPickedFromMap !== '' && SkyShop.order.shipmentStreetPickedFromMap !== null ){
      $('select.core_orderShipmentSelectStreet')
          .val(SkyShop.order.shipmentStreetPickedFromMap)
          .trigger('select2:select').trigger('change');
    }else{
      $('select.core_orderShipmentSelectStreet')
          .val(cookies.read('ac_ship' + key + '_method'))
          .trigger('select2:select').trigger('change');
    }

    $('[data-streets="' + key + '"]').select2({
      theme: 'bootstrap',
      width: '100%',
      placeholder: '-- '+ L['SELECT']+ ' --',
      allowClear: true,
      language: {
        noResults: function(){
          return L['FIRST_SELECT_CITY'];
        }
      },
      escapeMarkup: function(markup){
        return markup;
      },
      templateResult: function(result){
        if(result.id == ''){
          return result.text;
        }

        var options = {},
            option;

        if(typeof result.element !== 'undefined'){
          option = result.element.getAttribute('data-options').split('|');
          option.forEach(function(i){
            i = i.split(':');

            options[i[0]] = i[1];
          });
        }

        switch(type){
          case 'paczkomaty':
            return [
              '<div class="order-shipment-item">',
              '<div class="order-shipment-item-logo">',
              '<img src="/inc/shipments/paczkomaty/inpost-logo.png" />',
              '</div>',
              '<div class="order-shipment-item-name">',
              '<div class="order-shipment-item-name-wrapper">',
              '<div>' + result.text + '</div>',
              typeof options.description != 'undefined' && options.description != '' ? '<div><small>' + options.description + '</small></div>' : '',
              '</div>',
              '</div>',
              '</div>'
            ].join('');
            break;
          case 'paczka_w_ruchu':
            return [
              '<div class="order-shipment-item">',
              '<div class="order-shipment-item-logo">',
              '<img src="/inc/shipments/paczka_w_ruchu/kiosk.png" />',
              '</div>',
              '<div class="order-shipment-item-name">',
              '<div class="order-shipment-item-name-wrapper">',
              '<div>' + result.text + '</div>',
              typeof options.description != 'undefined' && options.description != '' ? '<div><small>' + options.description + '</small></div>' : '',
              '</div>',
              '</div>',
              '</div>'
            ].join('');
            break;
          case 'odbior_w_punkcie':
            return [
              '<div class="order-shipment-item">',
              '<div class="order-shipment-item-logo">',
              '<img src="/inc/shipments/odbior_w_punkcie/punkt_pp.png" />',
              '</div>',
              '<div class="order-shipment-item-name">',
              '<div class="order-shipment-item-name-wrapper">',
              '<div>' + result.text + '</div>',
              typeof options.description != 'undefined' && options.description != '' ? '<div><small>' + options.description + '</small></div>' : '',
              '</div>',
              '</div>',
              '</div>'
            ].join('');
            break;
          default:
            return result.text;
            break;
        };
      }
    }).on('select2:open',function(){
      $('.select2-results > ul').scrollbar();
    }).on('select2:closing',function(){
      $('.select2-results > ul').scrollbar('destroy');
    });
    $('[data-key= "' + key +'"]').eq(1).select2({
      theme: 'bootstrap',
      width: '100%',
      placeholder: '-- '+ L['SELECT']+ ' --',
      allowClear: true,
    })
    $('[data-key= "' + key +'"]').eq(1).on("select2:unselecting", function(e) {
      cookies.create('ac_methods', '')
      $('[data-streets="' + key + '"]').html(' ');
      $('[data-streets="' + key + '"]').val(' ').trigger('change')
    });
    if(typeof callback !== 'undefined'){
      callback();
    }
  }



  if (SkyShop.order.shipmentsParsed[key].streets[$.base64Encode(pickedCity)] !== undefined && SkyShop.order.shipmentsParsed[key].streets[$.base64Encode(pickedCity)].length >= 1) {
    renderStreetsOptions()
  }
  else if (pickedCity === '' || pickedCity === null) {
    showHideStreetSelect('show')
  }
  else{
    if(pickedCity !== '' && pickedCity !== null) {
      try {
        $.ajax({
          method: 'GET',
          beforeSend:  () => {
            showHideStreetSelect('hide')
          },
          url: `/order/?json=1&action=loadSpecialFunctionPointsByCity&function=${type}&cod=${cod}&country=${SkyShop.order.userCountry}&city=${pickedCity}`,
        })
        .done(function (data) {
          storeStreets(data, ['name|name', 'description|description', 'id|id'], $.base64Encode(pickedCity))
        });
      } catch (error) {
        console.log('Error occurred');
        console.log(error);
      }
    }
  }

};

/* ================================================================================================================
 * NEEDED VARS
 */

var mapObj;
var SUBMIT_TEXT;
