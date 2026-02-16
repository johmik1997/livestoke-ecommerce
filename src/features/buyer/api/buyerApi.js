import ApiService from "@/service/ApiService";

const api = new ApiService();
const BASE_URL = "http://localhost:8380/api/medco-digital-parking/v1/api/orders";

export default {
  getBuyerOrders(userUuid, page = 0, size = 10) {
    return api
      .addAuthenticationHeader()
      .get(`${BASE_URL}/buyer/${userUuid}?page=${page}&size=${size}`);
  },


  getOrderByUuid(orderUuid, userUuid) {
    return api
      .addAuthenticationHeader()
      .get(`${BASE_URL}/${orderUuid}/by/${userUuid}`);
  },

  cancelOrder(orderUuid, userUuid) {
    return api
      .addAuthenticationHeader()
      .post(`${BASE_URL}/${orderUuid}/cancel/${userUuid}`);
  },

  processPayment(orderUuid, userUuid, transactionId) {
    return api
      .addAuthenticationHeader()
      .post(`${BASE_URL}/${orderUuid}/payment/${userUuid}?transactionId=${transactionId}`);
  }

};