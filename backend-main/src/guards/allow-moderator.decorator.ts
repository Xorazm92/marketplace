import { SetMetadata } from '@nestjs/common';

export const ALLOW_MODERATOR = 'inbola:allow-moderator';

// AdminGuard MODERATOR rolini standart holatda RAD etadi. Moderatorga ochiq endpoint
// shu dekorator bilan aniq belgilanadi — yangi admin endpoint'i unutib qo'yilsa ham
// moderatorga o'zidan-o'zi ochilib qolmaydi. Matritsa: docs/PERMISSIONS.md.
export const AllowModerator = () => SetMetadata(ALLOW_MODERATOR, true);
