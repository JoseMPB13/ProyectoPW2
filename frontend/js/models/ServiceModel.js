export default class ServiceModel {
    constructor(api) {
        this.api = api;
        this.endpoint = '/services';
    }

    async getServices() {
        return await this.api.get(this.endpoint);
    }

    async createService(data) {
        return await this.api.post(this.endpoint, data);
    }

    async updateService(id, data) {
        return await this.api.put(`${this.endpoint}/${id}`, data);
    }

    async deleteService(id) {
        return await this.api.delete(`${this.endpoint}/${id}`);
    }
}
