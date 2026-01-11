import { useState, useEffect } from "react";
import api from "../api/axios";

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get("/services");
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <div className="p-4">Cargando servicios...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Catálogo de Servicios
      </h1>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nombre
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Descripción
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Precio Base
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {service.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {service.description || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${service.base_price.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No hay servicios registrados.
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
