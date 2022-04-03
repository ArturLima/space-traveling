import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function formatDate(data: string) {
  return format(new Date(data), 'MM/dd/yyyy', {
    locale: ptBR,
  });
}
