// EduBook Global Store & LocalStorage Persistence
import { initialEquipment, initialReservations, initialUsers, initialActivities } from './mockData.js';

class EduBookStore {
  constructor() {
    this.storageKeys = {
      equipment: 'edubook_equipment',
      reservations: 'edubook_reservations',
      users: 'edubook_users',
      currentUser: 'edubook_current_user',
      activities: 'edubook_activities'
    };

    this.state = {
      equipment: [],
      reservations: [],
      users: [],
      currentUser: null,
      activities: []
    };

    this.listeners = [];
    this.init();
  }

  init() {
    // Load or initialize equipment
    this.state.equipment = this.getOrSet(this.storageKeys.equipment, initialEquipment);
    // Load or initialize reservations
    this.state.reservations = this.getOrSet(this.storageKeys.reservations, initialReservations);
    // Load or initialize users
    this.state.users = this.getOrSet(this.storageKeys.users, initialUsers);
    // Load or initialize activities
    this.state.activities = this.getOrSet(this.storageKeys.activities, initialActivities);
    
    // Load current user (default to M. Martin - Teacher if not set)
    const savedUser = localStorage.getItem(this.storageKeys.currentUser);
    if (savedUser) {
      this.state.currentUser = JSON.parse(savedUser);
    } else {
      this.state.currentUser = this.state.users[0]; // M. Martin
      this.saveCurrentUser();
    }
  }

  getOrSet(key, defaultValue) {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Error parsing storage key: " + key, e);
      }
    }
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }

  // --- State Listeners ---
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // --- Save helpers ---
  saveEquipment() {
    localStorage.setItem(this.storageKeys.equipment, JSON.stringify(this.state.equipment));
    this.notify();
  }

  saveReservations() {
    localStorage.setItem(this.storageKeys.reservations, JSON.stringify(this.state.reservations));
    this.notify();
  }

  saveCurrentUser() {
    localStorage.setItem(this.storageKeys.currentUser, JSON.stringify(this.state.currentUser));
    this.notify();
  }

  saveActivities() {
    localStorage.setItem(this.storageKeys.activities, JSON.stringify(this.state.activities));
    this.notify();
  }

  // --- Current User management ---
  setCurrentUser(userId) {
    const user = this.state.users.find(u => u.id === userId);
    if (user) {
      this.state.currentUser = user;
      this.saveCurrentUser();
      this.addActivity("Utilisateur connecté en tant que", user.name);
    }
  }

  getCurrentUser() {
    return this.state.currentUser;
  }

  getUsers() {
    return this.state.users;
  }

  // --- Equipment Actions ---
  getEquipment() {
    return this.state.equipment;
  }

  addEquipment(item) {
    const newId = `eq-${Date.now()}`;
    const newItem = {
      ...item,
      id: newId,
      status: item.status || 'available',
      imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500&auto=format&fit=crop&q=60'
    };
    this.state.equipment.unshift(newItem);
    this.saveEquipment();
    this.addActivity("a ajouté le matériel", newItem.name);
    return newItem;
  }

  updateEquipment(itemId, updatedFields) {
    this.state.equipment = this.state.equipment.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updatedFields };
        this.addActivity("a mis à jour le matériel", updated.name);
        return updated;
      }
      return item;
    });
    this.saveEquipment();
  }

  deleteEquipment(itemId) {
    const item = this.state.equipment.find(eq => eq.id === itemId);
    if (item) {
      this.state.equipment = this.state.equipment.filter(eq => eq.id !== itemId);
      this.saveEquipment();
      
      // Also cancel active/pending reservations for this item
      this.state.reservations = this.state.reservations.map(res => {
        if (res.equipmentId === itemId && (res.status === 'pending' || res.status === 'approved')) {
          return { ...res, status: 'cancelled' };
        }
        return res;
      });
      this.saveReservations();
      
      this.addActivity("a supprimé le matériel", item.name);
    }
  }

  // --- Reservations Actions ---
  getReservations() {
    return this.state.reservations;
  }

  // Check if a slot conflicts with an existing approved/pending reservation
  checkConflict(equipmentId, startDate, endDate, timeSlot, excludeReservationId = null) {
    return this.state.reservations.some(res => {
      if (res.equipmentId !== equipmentId) return false;
      if (res.id === excludeReservationId) return false;
      if (res.status !== 'approved' && res.status !== 'pending') return false;

      // Simple date overlap check
      const dStart = new Date(startDate);
      const dEnd = new Date(endDate);
      const resStart = new Date(res.startDate);
      const resEnd = new Date(res.endDate);

      const overlapDate = dStart <= resEnd && dEnd >= resStart;
      
      // If dates overlap, check if timeSlot is the same
      if (overlapDate) {
        return res.timeSlot === timeSlot;
      }
      return false;
    });
  }

  createReservation(bookingData) {
    const { equipmentId, startDate, endDate, timeSlot, purpose } = bookingData;
    
    // Check conflicts
    const conflict = this.checkConflict(equipmentId, startDate, endDate, timeSlot);
    if (conflict) {
      throw new Error("Ce matériel est déjà réservé pour ces dates et créneaux horaires.");
    }

    const item = this.state.equipment.find(eq => eq.id === equipmentId);
    if (!item) throw new Error("Matériel introuvable.");
    if (item.status === 'outoforder') throw new Error("Ce matériel est hors service.");

    const newRes = {
      id: `res-${Date.now()}`,
      equipmentId,
      userId: this.state.currentUser.id,
      userName: this.state.currentUser.name,
      startDate,
      endDate,
      timeSlot,
      purpose,
      status: this.state.currentUser.role === 'admin' ? 'approved' : 'pending',
      requestDate: new Date().toISOString()
    };

    this.state.reservations.unshift(newRes);
    this.saveReservations();

    // If approved immediately (by admin), mark item as reserved
    if (newRes.status === 'approved') {
      this.updateEquipmentStatus(equipmentId);
    }

    this.addActivity("a demandé la réservation de", item.name);
    return newRes;
  }

  updateReservationStatus(resId, status) {
    const res = this.state.reservations.find(r => r.id === resId);
    if (!res) return;

    res.status = status;
    this.saveReservations();

    const item = this.state.equipment.find(eq => eq.id === res.equipmentId);
    
    if (status === 'approved') {
      this.updateEquipmentStatus(res.equipmentId);
      this.addActivity("a approuvé la réservation pour", item ? item.name : "un matériel");
    } else if (status === 'rejected') {
      this.updateEquipmentStatus(res.equipmentId);
      this.addActivity("a rejeté la réservation pour", item ? item.name : "un matériel");
    } else if (status === 'cancelled') {
      this.updateEquipmentStatus(res.equipmentId);
      this.addActivity("a annulé la réservation pour", item ? item.name : "un matériel");
    }
  }

  prolongReservation(resId) {
    const res = this.state.reservations.find(r => r.id === resId);
    if (!res) return;

    // Send a notification/request to administrator by adding an activity
    const item = this.state.equipment.find(eq => eq.id === res.equipmentId);
    this.addActivity("a demandé une prolongation pour", item ? item.name : "un matériel");
    
    // Just simple flag for demo
    res.prolongationRequested = true;
    this.saveReservations();
  }

  // Helper to dynamically calculate equipment status based on approved bookings on current day
  updateEquipmentStatus(equipmentId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const item = this.state.equipment.find(eq => eq.id === equipmentId);
    if (!item) return;

    // If item is outoforder or maintenance, preserve it unless admin changed it
    if (item.status === 'outoforder' || item.status === 'maintenance') {
      return;
    }

    // Check if there is an approved reservation right now
    const hasApprovedToday = this.state.reservations.some(res => 
      res.equipmentId === equipmentId &&
      res.status === 'approved' &&
      todayStr >= res.startDate &&
      todayStr <= res.endDate
    );

    const newStatus = hasApprovedToday ? 'reserved' : 'available';
    if (item.status !== newStatus) {
      item.status = newStatus;
      this.saveEquipment();
    }
  }

  updateAllEquipmentStatus() {
    this.state.equipment.forEach(eq => {
      this.updateEquipmentStatus(eq.id);
    });
  }

  // --- Activities ---
  getActivities() {
    return this.state.activities;
  }

  addActivity(action, itemName) {
    const newAct = {
      id: `act-${Date.now()}`,
      userName: this.state.currentUser ? this.state.currentUser.name : "Système",
      action,
      itemName,
      time: "À l'instant"
    };
    this.state.activities.unshift(newAct);
    // Keep last 15 activities
    if (this.state.activities.length > 15) {
      this.state.activities.pop();
    }
    this.saveActivities();
  }
}

const store = new EduBookStore();
// Perform initial update of statuses
store.updateAllEquipmentStatus();

export default store;
