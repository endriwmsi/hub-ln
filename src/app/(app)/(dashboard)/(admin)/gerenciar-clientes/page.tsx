import { ClientsTableContainer } from "@/features/clients";
import { getServices } from "@/features/services/actions";
import { getUsers } from "@/features/users/actions";

export default async function GerenciarClientesPage() {
  // Buscar serviços para filtros
  const servicesData = await getServices(false);
  const services = servicesData.map((s) => ({ id: s.id, title: s.title }));

  // Buscar todos os usuários/parceiros para filtros (múltiplas páginas)
  const allUsers: Array<{ id: string; name: string; email: string }> = [];
  let currentPage = 1;
  let hasMore = true;

  while (hasMore) {
    const usersResult = await getUsers({
      page: currentPage,
      pageSize: 100,
      sortBy: "name",
      sortOrder: "asc",
    });

    if (usersResult.success && usersResult.data) {
      const pageUsers = usersResult.data.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
      }));
      allUsers.push(...pageUsers);

      // Verifica se tem mais páginas
      hasMore =
        usersResult.data.pagination.page <
        usersResult.data.pagination.totalPages;
      currentPage++;
    } else {
      hasMore = false;
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Gerenciar Clientes
        </h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todos os clientes de todas as ações e envios
        </p>
      </div>

      <ClientsTableContainer services={services} users={allUsers} />
    </div>
  );
}
