// EduBook — Client Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://qfsfgwstyravccdqbtlz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_C1udJKTUMXy_A5DtQyCYLw_tOPOBvM0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
