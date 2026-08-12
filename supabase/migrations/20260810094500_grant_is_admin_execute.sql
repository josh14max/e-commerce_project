/*
# Autorisation d'exécution pour is_admin()

Garantit explicitement que les utilisateurs connectés peuvent appeler
is_admin() depuis le site (via supabase.rpc('is_admin')), nécessaire pour
que la page /admin sache si la personne connectée a les droits d'administration.
*/

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
