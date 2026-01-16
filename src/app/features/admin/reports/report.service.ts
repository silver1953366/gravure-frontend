import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MonthlyRevenue {
    month: string; // Format 'YYYY-MM'
    revenue: number;
}

export interface RevenueReport {
    message: string;
    summary: {
        total_revenue_fcfa: number;
        total_completed_orders: number;
        average_order_value_fcfa: number;
    };
    monthly_breakdown: MonthlyRevenue[];
}

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    
    private readonly apiUrl = `${environment.apiUrl}/admin/reports`; 
    private readonly revenueUrl = `${this.apiUrl}/revenue`; 

    constructor(private http: HttpClient) {}

    getRevenueReport(startDate?: string, endDate?: string): Observable<RevenueReport> {
        let params = new HttpParams();
        
        if (startDate) {
            params = params.set('start_date', startDate);
        }
        if (endDate) {
            params = params.set('end_date', endDate);
        }
        
        return this.http.get<RevenueReport>(this.revenueUrl, { params });
    }
}