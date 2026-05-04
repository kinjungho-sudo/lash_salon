export type BookingStatus = 'confirmed' | 'cancelled' | 'no_show'

export interface OwnerProfile {
  id: string
  shop_name: string | null
  google_calendar_id: string | null
  gcal_refresh_token: string | null
  gcal_access_token: string | null
  gcal_token_expires_at: string | null
  consent_terms_at: string | null
  consent_marketing: boolean
  created_at: string
}

export interface Customer {
  id: string
  owner_id: string
  name: string
  phone: string | null
  district: string | null
  district_lat: number | null
  district_lng: number | null
  memo: string | null
  created_at: string
}

export interface Menu {
  id: string
  owner_id: string
  name: string
  price: number
  duration_min: number
  color_tag: string | null
  is_active: boolean
  created_at: string
}

export interface Booking {
  id: string
  owner_id: string
  customer_id: string
  menu_id: string
  start_at: string
  end_at: string
  google_event_id: string | null
  status: BookingStatus
  created_at: string
  customer?: Customer
  menu?: Menu
}

export interface TrendKeyword {
  id: string
  owner_id: string
  keyword: string
  last_search_volume: number | null
  last_fetched_at: string | null
  created_at: string
}

export interface TrendHistory {
  id: string
  keyword_id: string
  period_date: string
  search_ratio: number | null
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      lash_salon_owner_profiles: {
        Row: OwnerProfile
        Insert: Omit<OwnerProfile, 'created_at'>
        Update: Partial<Omit<OwnerProfile, 'id' | 'created_at'>>
      }
      lash_salon_customers: {
        Row: Customer
        Insert: Omit<Customer, 'id' | 'created_at'>
        Update: Partial<Omit<Customer, 'id' | 'owner_id' | 'created_at'>>
      }
      lash_salon_menus: {
        Row: Menu
        Insert: Omit<Menu, 'id' | 'created_at'>
        Update: Partial<Omit<Menu, 'id' | 'owner_id' | 'created_at'>>
      }
      lash_salon_bookings: {
        Row: Booking
        Insert: Omit<Booking, 'id' | 'created_at' | 'customer' | 'menu'>
        Update: Partial<Omit<Booking, 'id' | 'owner_id' | 'created_at' | 'customer' | 'menu'>>
      }
      lash_salon_trend_keywords: {
        Row: TrendKeyword
        Insert: Omit<TrendKeyword, 'id' | 'created_at'>
        Update: Partial<Omit<TrendKeyword, 'id' | 'owner_id' | 'created_at'>>
      }
      lash_salon_trend_history: {
        Row: TrendHistory
        Insert: Omit<TrendHistory, 'id' | 'created_at'>
        Update: Partial<Omit<TrendHistory, 'id' | 'created_at'>>
      }
    }
  }
}
