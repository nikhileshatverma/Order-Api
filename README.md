# OrderAPI Documentation

## Base URL
Base URL of Backend to hit: [https://orderapi.letsgrowease.workers.dev/api/v1/trades](https://orderapi.letsgrowease.workers.dev/api/v1/trades)

## Endpoints
- [Get Orders](https://orderapi.letsgrowease.workers.dev/api/v1/order)
- [Post Order](https://orderapi.letsgrowease.workers.dev/api/v1/order)
- [Update Order](https://orderapi.letsgrowease.workers.dev/api/v1/order/{OrderId})
- [Delete Order](https://orderapi.letsgrowease.workers.dev/api/v1/order/{OrderId})
- [Get Orders by Id](https://orderapi.letsgrowease.workers.dev/api/v1/order/{OrderId})
- [Get Trades](https://orderapi.letsgrowease.workers.dev/api/v1/trades)

## Postman Collection
[Postman Collection Link](https://drive.google.com/file/d/1UxrIKPM2MqiSZdpoyZMhoGO_L6NNdnhp/view?usp=sharing)

## Post Order Request Body Example
```json
{
    "quantity": 111,
    "price": 3333,
    "side": "BUY"
}

Example Response Body of order creation :
{
    "order": {
        "id": "bfca74c0-3d04-475c-bca4-59cb663e04d2",
        "quantity": 10,
        "price": 101,
        "side": "BUY",
        "orderStatus": "OPEN",
        "createdAt": "2024-03-21T13:05:21.840Z",
        "userId": "cdfec199-0714-45fe-b31e-46ceafc91c30"
    }
}


Update Order Req Body :
{
  "updatedQuantity": 4110,
  "updatedPrice": 2320
}

Example Response Body of order Updation :
{
    "success": true,
    "updatedOrder": {
        "id": "c014bdef-8641-4312-b18a-7efbc92d49a6",
        "quantity": 4110,
        "price": 2320,
        "side": "BUY",
        "orderStatus": "OPEN",
        "createdAt": "2024-03-22T19:57:49.500Z",
        "userId": "794e6d2c-6c71-454f-ba12-97316b2c0dcf"
    }
}

Example Response Body of order Updation :
{
    "trades": [
        {
            "id": "fb8c3d99-953c-4524-b128-d97196979da2",
            "executionTimestamp": "2024-03-22T13:27:45.097Z",
            "price": 3333,
            "quantity": 244242,
            "orderId": "877c8eb2-6367-459e-9855-498f452c323e",
            "bidOrderId": "3333",
            "askOrderId": "3333"
        }
}





