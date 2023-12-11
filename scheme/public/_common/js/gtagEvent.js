const gtagEvent = (eventType, itemOptions, signLoginUpMethod) => {

    if(!document.querySelector('body').getAttribute('data-gtag-events') ) return

    const itemConverter = () =>{

        let gtagItemData = {
            currency: document.querySelector('body').getAttribute('data-used').split('|')[0] || '',
            ...(itemOptions.value) && {value : itemOptions.value || ''},
            ...(itemOptions.payment_type) &&  {payment_type : itemOptions.payment_type || ''},
            ...(itemOptions.shipping_tier) &&  {shipping_tier : itemOptions.shipping_tier || ''},
            ...(itemOptions.item_list_id) && {item_list_id : itemOptions.item_list_id || ''},
            ...(itemOptions.item_list_name) && {item_list_name : itemOptions.item_list_name || ''},
            items : []
        }

        Object.entries(itemOptions.item ? itemOptions.item : itemOptions).map(el => {
            typeof el[1] === 'object' && el[0] !== 'analytics' && el[1] !== null && el[1].length !== 0
                ? gtagItemData.items.push({
                    item_id: el[1].id || '',
                    item_name: el[1].name || '',
                    price: el[1].price || '',
                    quantity: el[1].amount || '',
                    ...(el[1].item_brand) && {item_brand : el[1].item_brand || ''},
                    ...(el[1].item_category) && {item_category : el[1].item_category || ''},
                    ...(el[1].item_list_name) && {item_list_name : el[1].item_list_name || ''},
                    ...(el[1].currency) && {currency : el[1].currency || ''},
                })
                : (
                    gtagItemData.value = itemOptions.price * itemOptions.amount,
                        gtagItemData.items = [{
                            item_id: itemOptions.id || '',
                            item_name: itemOptions.name || '',
                            price: itemOptions.price || '',
                            quantity: itemOptions.amount || '',
                            ...(itemOptions.item_brand) && {item_brand : itemOptions.item_brand || ''},
                            ...(itemOptions.item_category) && {item_category : itemOptions.item_category || ''},
                            ...(itemOptions.item_list_name) && {item_list_name : itemOptions.item_list_name || ''},
                            ...(itemOptions.currency) && {currency : itemOptions.currency || ''},
                        }]
                )
        })

        return gtagItemData
    }

    const callEventGtagDependency = () => {
        gtag('event', eventType,  itemConverter())
    }

    const callEventGtagSingLoginUp = () => {
        gtag('event', eventType, {
            method : signLoginUpMethod
        })
    }

    switch (eventType) {
        case 'sign_up':
            callEventGtagSingLoginUp()
            break;
        case 'login':
            callEventGtagSingLoginUp()
            break;
        default:
            callEventGtagDependency()
            break;
    }

}