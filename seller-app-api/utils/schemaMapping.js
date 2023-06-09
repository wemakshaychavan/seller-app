const config = require("../lib/config");
const logger = require("../lib/logger");

const BPP_ID = config.get("sellerConfig").BPP_ID
const BPP_URI = config.get("sellerConfig").BPP_URI

exports.getProducts = async (data) => {

    let bppDetails ={}
    let bppProviders =[]
    for(const org of data?.data){
        let productAvailable = []
        for(let items of org.items){
            let item =  {
                "id": items._id,
                "descriptor": {
                    "name": items.productName,
                    "symbol": items.images[0],
                    "short_desc": items.description,
                    "long_desc": items.longDescription,
                    "images": items.images
                },
                "price": {
                    "currency": "INR",
                    "value":  items.MRP,
                    "maximum_value": items.MRP
                },
                "quantity": {
                    "available": {
                        "count": items.quantity
                    },
                    "maximum": {
                        "count": items.maxAllowedQty
                    }
                },
                "category_id": items.productCategory,
                "location_id": org.storeDetails.location._id,
                "fulfillment_id": org.storeDetails.location._id,//TODO: following shoplyst
                "matched": true,
                "@ondc/org/returnable":  items.isReturnable??false,
                "@ondc/org/cancellable":  items.isCancellable??false,
                "@ondc/org/available_on_cod": items.availableOnCod,
                "@ondc/org/time_to_ship": "PT48H",
                "@ondc/org/seller_pickup_return": true,
                "@ondc/org/return_window": "P7D",
                "@ondc/org/contact_details_consumer_care": `${org.storeDetails.supportDetails.email},${org.storeDetails.supportDetails.mobile}`,
                "@ondc/org/mandatory_reqs_veggies_fruits": {
                    "net_quantity": items.packQty
                }

            }
            productAvailable.push(item)
        }

        bppDetails = {
            "name": org.name,
                "symbol": org.storeDetails.logo,
                "short_desc": "", //TODO: mark this for development
                "long_desc": "",
                "images": [
                    org.storeDetails.logo
            ]
        },
        bppProviders.push(            {
            "id": org._id,
            "descriptor": {
                "name": org.name,
                "symbol": org.storeDetails.logo,
                "short_desc": "",
                "long_desc": "",
                "images": [
                    org.storeDetails.logo
                ]
            },
            "locations": [
                {
                    "id": org.storeDetails.location._id,
                    "gps": "28.483664, 77.000427", //TODO: hard coded for now,
                    "address":org.storeDetails.address,
                    "time": { //TODO: hard coded for now
                        "range": {
                            "start": "0000",
                            "end": "2359"
                        },
                        "days": "1,2,3,4,5,6,7"
                    }
                }
            ],
            "ttl": "PT24H",
            "items": productAvailable,
            "fulfillments":
                [
                    {
                        "contact":
                            {
                                "phone":org.storeDetails.supportDetails.mobile,
                                "email":org.storeDetails.supportDetails.email
                            }
                    }
                ],
            "tags": [
                {
                    "code": "serviceability",
                    "list": [
                        {
                            "code": "location",
                            "value": org.storeDetails.location._id
                        },
                        {
                            "code": "category", //TODO: hard coded for now
                            "value": "Fruits and Vegetables"
                        },
                        {
                            "code": "type",
                            "value": "12"
                        },
                        {
                            "code": "val",
                            "value": "IND"
                        },
                        {
                            "code": "unit",
                            "value": "country"
                        }
                    ]
                }],
            "@ondc/org/fssai_license_no": org.FSSAI
        })

    }

    //set product items to schema

    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_search'
    const schema = {
        "context": {...context},
        "message": {
            "catalog": {
                "bpp/fulfillments":
                    [
                        {
                            "id":"1",
                            "type":"Delivery"
                        },
                        {
                            "id":"2",
                            "type":"Self-Pickup"
                        },
                        {
                            "id":"3",
                            "type":"Delivery and Self-Pickup"
                        }
                    ],
                "bpp/descriptor": bppDetails,
                "bpp/providers": bppProviders
            }
        }
    }



    return schema



}



exports.getSelect = async (data) => {

    logger.log('info', `[Schema mapping ] build retail select request from :`, data);

    let productAvailable = []
    //set product items to schema

    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_select'
    const schema = {
        "context": {...context},
        "message": {
            "order": {
                "provider":data.order.provider,
                "fulfillments":data.order.fulfillments,
                "quote": {
                    "price":data.totalPrice,
                    "breakup": data.detailedQoute,
                    "ttl": "P1D"
                },
                "items": data.qouteItems
            }
        }
    }

    logger.log('info', `[Schema mapping ] after build retail select request :`, schema);

    return schema

}

exports.getInit = async (data) => {

    let productAvailable = []
    //set product items to schema

    console.log("data.message.order.provider",data.message.order)
    console.log("data.message.order.provider_location",data.message.order.provider_location)
    console.log("data.message.order.billing",data.message.order.billing)
    console.log("data.message.order.fulfillments",data.message.order.fulfillments)
    console.log("data.message.order.payment",data.message.order.payment)
    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_init'
    const schema = {
        "context": {...context},
        "message":  {
            "order": {
                "provider":data.message.order.provider,
                "provider_location": data.message.order.provider_location,
                "items": data.qouteItems,
                "billing": data.message.order.billing,
                "fulfillments": data.message.order.fulfillments,
                "quote":{
                    "price":data.totalPrice,
                    "breakup": data.detailedQoute,
                    "ttl": "P1D"
                },
                "payment": data.message.order.payment
            }
        }
    }



    return schema

}

exports.getStatus = async (data) => {

    let productAvailable = []
    //set product items to schema

    // console.log("data.message.order.provider",data.message.order)
    // console.log("data.message.order.provider_location",data.message.order.provider_location)
    // console.log("data.message.order.billing",data.message.order.billing)
    // console.log("data.message.order.fulfillments",data.message.order.fulfillments)
    // console.log("data.message.order.payment",data.message.order.payment)
    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_status'
    const schema = {
        "context": {...context},
        "message":  {
            "order": {
                "provider":{"id": "afe44f35-fb0c-527b-8a80-a1b0b839197e"}, //TODO: map to strapi
                "state":data.updateOrder.state,
                "items": data.updateOrder.items,
                "billing": data.updateOrder.billing,
                "fulfillments": data.updateOrder.fulfillments,
                "quote":  data.updateOrder.quote,
                "payment": data.updateOrder.payment,
                 "id" :  data.updateOrder.id
            }
        }
    }



    return schema

}

exports.getCancel = async (data) => {

    let productAvailable = []
    //set product items to schema

    // console.log("data.message.order.provider",data.message.order)
    // console.log("data.message.order.provider_location",data.message.order.provider_location)
    // console.log("data.message.order.billing",data.message.order.billing)
    // console.log("data.message.order.fulfillments",data.message.order.fulfillments)
    // console.log("data.message.order.payment",data.message.order.payment)
    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_cancel'
    const schema = {
        "context": {...context},
        "message":  {
            "order": {
                "provider":{"id": "afe44f35-fb0c-527b-8a80-a1b0b839197e"}, //TODO: map to strapi
                "state":data.updateOrder.state,
                "items": data.updateOrder.items,
                "billing": data.updateOrder.billing,
                "fulfillments": data.updateOrder.fulfillments,
                "quote":  data.updateOrder.quote,
                "payment": data.updateOrder.payment,
                "id" :  data.updateOrder.id
            }
        }
    }



    return schema

}

exports.getTrack = async (data) => {

    let productAvailable = []
    //set product items to schema

    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_track'
    const schema = {
        "context": {...context},
        "message":  {
            "tracking":
                    data.logisticData.message.tracking

        }
    }
    return schema

}
exports.getSupport = async (data) => {

    let productAvailable = []
    //set product items to schema

    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_support'
    const schema = {
        "context": {...context},
        "message":  data.logisticData.message

    }
    return schema

}
exports.getConfirm = async (data) => {

    let productAvailable = []
    //set product items to schema

    console.log("data.message.order.provider",data.message.order.order_id)
    console.log("data.message.order.provider_location",data.message.order.provider_location)
    console.log("data.message.order.billing",data.message.order.billing)
    console.log("data.message.order.fulfillments",data.message.order.fulfillments)
    console.log("data.message.order.payment",data.message.order.payment)
    let context = data.context
    context.bpp_id =BPP_ID
    context.bpp_uri =BPP_URI
    context.action ='on_confirm'
    const schema = {
        "context": {...context},
        "message":  {
            "order": {
                "id":data.message.order.order_id,
                "state":"Created",
                "provider": {"id": "afe44f35-fb0c-527b-8a80-a1b0b839197e"},
                "provider_location": data.message.order.provider_location,
                "items": data.qouteItems,
                "billing": data.message.order.billing,
                "fulfillments": data.message.order.fulfillments,
                "quote":{
                    "price":data.totalPrice,
                    "breakup": data.detailedQoute,
                    "ttl": "P1D"
                },
                "payment": data.message.order.payment
            }
        }
    }

    //
    // {
    //     "context": {
    //     "domain": "nic2004:52110",
    //         "country": "IND",
    //         "city": "std:080",
    //         "action": "on_confirm",
    //         "core_version": "1.0.0",
    //         "bap_id": "buyer-app.ondc.org",
    //         "bap_uri": "https://9c04-182-72-58-210.in.ngrok.io/protocol/v1",
    //         "transaction_id": "1fd6135c-6349-4b3b-b312-80ad4b780ff3",
    //         "message_id": "b215e15c-e13f-42d9-8e9f-312c73e1f6e5",
    //         "timestamp": "2022-09-19T08:08:57.385Z",
    //         "bpp_id": "ondcstage.hulsecure.in",
    //         "bpp_uri": "https://ondcstage.hulsecure.in/v1"
    // },
    //     "message": {
    //     "order": {
    //         "id": "df038d05-6599-4dd9-9726-08209ce52b81",
    //             "provider": {
    //             "id": "afe44f35-fb0c-527b-8a80-a1b0b839197e"
    //         },
    //         "items": [
    //             {
    //                 "id": "40287342887093",
    //                 "quantity": {
    //                     "count": 1
    //                 }
    //             }
    //         ],
    //             "billing": {
    //             "address": {
    //                 "door": "1",
    //                     "name": "1",
    //                     "building": "1",
    //                     "street": "1",
    //                     "locality": null,
    //                     "ward": null,
    //                     "city": "Pimpri Chinchwad",
    //                     "state": "Maharashtra",
    //                     "country": "IND",
    //                     "area_code": "411019"
    //             },
    //             "phone": "8181818191",
    //                 "name": "1",
    //                 "email": "aditya@dataorc.in"
    //         },
    //         "fulfillments": [
    //             {
    //                 "end": {
    //                     "contact": {
    //                         "email": "aditya@dataorc.in",
    //                         "phone": "8181818191"
    //                     },
    //                     "location": {
    //                         "gps": "18.639526, 73.7961000000001",
    //                         "address": {
    //                             "door": "1",
    //                             "name": "1",
    //                             "building": "1",
    //                             "street": "1",
    //                             "locality": null,
    //                             "ward": null,
    //                             "city": "Pimpri Chinchwad",
    //                             "state": "Maharashtra",
    //                             "country": "IND",
    //                             "area_code": "411019"
    //                         }
    //                     }
    //                 },
    //                 "type": "Delivery",
    //                 "customer": {
    //                     "person": {
    //                         "name": "1"
    //                     }
    //                 },
    //                 "provider_id": "afe44f35-fb0c-527b-8a80-a1b0b839197e"
    //             }
    //         ],
    //             "quote": {
    //             "price": {
    //                 "currency": "INR",
    //                     "value": "541"
    //             },
    //             "breakup": [
    //                 {
    //                     "@ondc/org/item_id": "40287342887093",
    //                     "@ondc/org/item_quantity": {
    //                         "count": 1
    //                     },
    //                     "title": "Dove Intense Repair Shampoo 1Ltr and Dove Intense Repair Conditioner 175ml (Combo Pack)",
    //                     "@ondc/org/title_type": "item",
    //                     "price": {
    //                         "currency": "INR",
    //                         "value": 541
    //                     }
    //                 },
    //                 {
    //                     "title": "Delivery charges",
    //                     "@ondc/org/title_type": "delivery",
    //                     "price": {
    //                         "currency": "INR",
    //                         "value": "0"
    //                     }
    //                 }
    //             ]
    //         },
    //         "payment": {
    //             "params": {
    //                 "amount": "541",
    //                     "currency": "INR"
    //             },
    //             "status": "NOT-PAID",
    //                 "type": "POST-FULFILLMENT",
    //                 "collected_by": "BPP"
    //         }
    //     }
    // }
    // }



    return schema

}