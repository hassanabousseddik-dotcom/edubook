// EduBook — Global Store (Supabase-backed)
import { supabase } from './supabase.js';
import { formatRelativeTime } from './utils/time.js';

class EduBookStore {
  constructor() {
    this.state = {
      equipment: [],
      reservations: [],
      users: [],
      currentUser: null,
      activities: []
    };
    this.listeners = [];
  }

  // --------------------------------------------------------
  // INIT — charge tout depuis Supabase
  // --------------------------------------------------------
  async initialize() {
    // Récupère le profil de l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    console.log("EduBook Auth User:", user);
    
    if (user) {
      let { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).maybeSingle();
      
      // Si aucun profil n'existe, on le crée automatiquement
      if (!profile) {
        const fallbackName =
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Utilisateur";

        console.error("DEBUG charAt value (initialize):", fallbackName);
        console.trace();

        const defaultProfile = {
          id: user.id,
          name: fallbackName,
          email: user.email || "",
          avatar: fallbackName.charAt(0).toUpperCase(),
          role: user.email?.includes("admin") ? "admin" : "teacher"
        };

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(defaultProfile)
          .select()
          .maybeSingle();

        if (!insertError && newProfile) {
          profile = newProfile;
        } else {
          profile = defaultProfile; // Garde-fou local en cas d'erreur insertion
        }
      }

      // Garantir que currentUser ne contient aucun champ critique undefined
      this.state.currentUser = {
        id: profile.id || user.id,
        name: profile.name || user.email?.split("@")[0] || "Utilisateur",
        email: profile.email || user.email || "",
        avatar: profile.avatar || "U",
        role: profile.role || (user.email?.includes("admin") ? "admin" : "teacher")
      };

      console.log("EduBook Profile:", this.state.currentUser);
    } else {
      this.state.currentUser = null;
      console.log("EduBook Profile: Aucun utilisateur connecté.");
    }

    await this.refreshAll();
    this.subscribeRealtime();
  }

  async refreshAll() {
    const [eq, res, profiles, acts] = await Promise.all([
      supabase.from('equipment').select('*').order('created_at'),
      supabase.from('reservations').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*'),
      supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(15)
    ]);

    this.state.equipment    = (eq.data    || []).map(this.mapEquipment);
    this.state.reservations = (res.data   || []).map(this.mapReservation);
    this.state.users        = profiles.data || [];
    this.state.activities   = (acts.data  || []).map(this.mapActivity);
    this.notify();
  }

  // Convertit snake_case → camelCase pour les composants existants
  mapEquipment(item) {
    return { ...item, imageUrl: item.image_url };
  }

  mapReservation(res) {
    return {
      ...res,
      equipmentId:           res.equipment_id,
      userId:                res.user_id,
      userName:              res.user_name,
      startDate:             res.start_date,
      endDate:               res.end_date,
      timeSlot:              res.time_slot,
      prolongationRequested: res.prolongation_requested,
      requestDate:           res.request_date
    };
  }

  mapActivity(act) {
    if (!act) return null;
    return {
      id: act.id,
      userName: act.user_name || act.userName || "Utilisateur",
      action: act.action || "a effectué une action sur",
      itemName: act.item_name || act.itemName || "un matériel",
      createdAt: act.created_at || new Date().toISOString(),
      time: formatRelativeTime(act.created_at || new Date().toISOString())
    };
  }

  // --------------------------------------------------------
  // REALTIME — mises à jour automatiques en temps réel
  // --------------------------------------------------------
  subscribeRealtime() {
    supabase.channel('edubook-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' },    () => this.refreshAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => this.refreshAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' },   () => this.refreshAll())
      .subscribe();
  }

  // --------------------------------------------------------
  // LISTENERS
  // --------------------------------------------------------
  subscribe(listener) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  notify() { this.listeners.forEach(l => l(this.state)); }

  // --------------------------------------------------------
  // GETTERS (synchrones — depuis le cache local)
  // --------------------------------------------------------
  getEquipment()    { return this.state.equipment; }
  getReservations() { return this.state.reservations; }
  getUsers()        { return this.state.users; }
  getCurrentUser()  { return this.state.currentUser; }
  getActivities()   { return this.state.activities; }

  // --------------------------------------------------------
  // EQUIPMENT — CRUD async
  // --------------------------------------------------------
  async addEquipment(item) {
    const { data, error } = await supabase.from('equipment').insert({
      name: item.name, category: item.category, ref: item.ref,
      description: item.description, status: item.status || 'available',
      image_url: item.imageUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500&auto=format&fit=crop&q=60'
    }).select().single();
    if (error) throw error;
    await this.addActivity('a ajouté le matériel', data.name);
    await this.refreshAll();
    return data;
  }

  async updateEquipment(itemId, fields) {
    const dbFields = {};
    if (fields.name)        dbFields.name        = fields.name;
    if (fields.category)    dbFields.category    = fields.category;
    if (fields.ref)         dbFields.ref         = fields.ref;
    if (fields.description) dbFields.description = fields.description;
    if (fields.status)      dbFields.status      = fields.status;
    if (fields.imageUrl)    dbFields.image_url   = fields.imageUrl;

    const { error } = await supabase.from('equipment').update(dbFields).eq('id', itemId);
    if (error) throw error;
    const item = this.state.equipment.find(eq => eq.id === itemId);
    await this.addActivity('a mis à jour le matériel', item?.name || '');
    await this.refreshAll();
  }

  async deleteEquipment(itemId) {
    const item = this.state.equipment.find(eq => eq.id === itemId);
    await supabase.from('reservations')
      .update({ status: 'cancelled' })
      .eq('equipment_id', itemId)
      .in('status', ['pending', 'approved']);
    const { error } = await supabase.from('equipment').delete().eq('id', itemId);
    if (error) throw error;
    if (item) await this.addActivity('a supprimé le matériel', item.name);
    await this.refreshAll();
  }

  // --------------------------------------------------------
  // RESERVATIONS
  // --------------------------------------------------------
  checkConflict(equipmentId, startDate, endDate, timeSlot, excludeId = null) {
    return this.state.reservations.some(res => {
      if (res.equipmentId !== equipmentId) return false;
      if (res.id === excludeId) return false;
      if (res.status !== 'approved' && res.status !== 'pending') return false;
      const overlap = new Date(startDate) <= new Date(res.endDate) &&
                      new Date(endDate)   >= new Date(res.startDate);
      return overlap && res.timeSlot === timeSlot;
    });
  }

  async createReservation({ equipmentId, startDate, endDate, timeSlot, purpose }) {
    if (this.checkConflict(equipmentId, startDate, endDate, timeSlot))
      throw new Error('Ce matériel est déjà réservé pour ces dates et créneaux horaires.');

    const item = this.state.equipment.find(eq => eq.id === equipmentId);
    if (!item) throw new Error('Matériel introuvable.');
    if (item.status === 'outoforder') throw new Error('Ce matériel est hors service.');

    const status = this.state.currentUser?.role === 'admin' ? 'approved' : 'pending';

    const { data, error } = await supabase.from('reservations').insert({
      equipment_id: equipmentId,
      user_id:      this.state.currentUser?.id,
      user_name:    this.state.currentUser?.name || 'Inconnu',
      start_date: startDate, end_date: endDate, time_slot: timeSlot,
      purpose, status
    }).select().single();

    if (error) throw error;
    if (status === 'approved') await this.syncEquipmentStatus(equipmentId);
    await this.addActivity('a demandé la réservation de', item.name);
    await this.refreshAll();
    return data;
  }

  async updateReservationStatus(resId, status) {
    const { error } = await supabase.from('reservations').update({ status }).eq('id', resId);
    if (error) throw error;
    const res = this.state.reservations.find(r => r.id === resId);
    if (res) {
      const item = this.state.equipment.find(eq => eq.id === res.equipmentId);
      await this.syncEquipmentStatus(res.equipmentId);
      const labels = { approved: 'a approuvé la réservation pour', rejected: 'a rejeté la réservation pour', cancelled: 'a annulé la réservation pour' };
      if (labels[status]) await this.addActivity(labels[status], item?.name || 'un matériel');
    }
    await this.refreshAll();
  }

  async prolongReservation(resId) {
    const { error } = await supabase.from('reservations')
      .update({ prolongation_requested: true }).eq('id', resId);
    if (error) throw error;
    const res = this.state.reservations.find(r => r.id === resId);
    const item = this.state.equipment.find(eq => eq.id === res?.equipmentId);
    await this.addActivity('a demandé une prolongation pour', item?.name || 'un matériel');
    await this.refreshAll();
  }

  async approveProlongation(resId) {
    const res = this.state.reservations.find(r => r.id === resId);
    if (!res) return;
    const newEnd = new Date(res.endDate);
    newEnd.setDate(newEnd.getDate() + 1);
    const newEndStr = newEnd.toISOString().split('T')[0];
    const { error } = await supabase.from('reservations')
      .update({ end_date: newEndStr, prolongation_requested: false }).eq('id', resId);
    if (error) throw error;
    const item = this.state.equipment.find(eq => eq.id === res.equipmentId);
    await this.addActivity('a approuvé la prolongation pour', item?.name || 'un matériel');
    await this.refreshAll();
  }

  async syncEquipmentStatus(equipmentId) {
    const item = this.state.equipment.find(eq => eq.id === equipmentId);
    if (!item || item.status === 'outoforder' || item.status === 'maintenance') return;
    const today = new Date().toISOString().split('T')[0];
    const isReservedToday = this.state.reservations.some(res =>
      res.equipmentId === equipmentId && res.status === 'approved' &&
      today >= res.startDate && today <= res.endDate
    );
    const newStatus = isReservedToday ? 'reserved' : 'available';
    if (item.status !== newStatus) {
      await supabase.from('equipment').update({ status: newStatus }).eq('id', equipmentId);
    }
  }

  // --------------------------------------------------------
  // ACTIVITIES
  // --------------------------------------------------------
  async addActivity(action, itemName) {
    const userName = this.state.currentUser?.name || 'Système';
    await supabase.from('activities').insert({ user_name: userName, action, item_name: itemName });
  }
}

const store = new EduBookStore();
export default store;
