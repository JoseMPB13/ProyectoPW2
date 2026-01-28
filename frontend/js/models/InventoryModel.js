export default class InventoryModel {
    constructor(api) {
        this.api = api;
        this.endpoint = '/inventory/parts';
    }

    async getParts() {
        return await this.api.get(this.endpoint);
    }

    async createPart(data) {
        return await this.api.post(this.endpoint, data);
    }

    async updatePart(id, data) {
        return await this.api.put(`${this.endpoint}/${id}`, data);
    }

    async deletePart(id) {
        return await this.api.delete(`${this.endpoint}/${id}`);
    }
}
