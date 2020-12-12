import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons/faFileAlt';
import { faChartLine } from '@fortawesome/free-solid-svg-icons/faChartLine';
import { AdminService } from '@services/admin/admin.service';
import { ShopService } from '@services/shop/shop.service';
import { isBothArrEqual } from '@utils/arrUtils';
import { VariantInterface } from '@models/Variant';
import { percentIncrease } from '@utils/calculation';
import { MatTableDataSource } from '@angular/material/table';
import { getSmallestThumbnail } from '@utils/media';
import { Router } from '@angular/router';
import { productRoute, VARIANT } from '@constants/routes';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  faChartLine = faChartLine;
  faFileAlt = faFileAlt;
  topVariantsLoading = false;

  totalSalesToday: number;
  totalOrdersToday: number;
  salePercentIncrease: number;
  orderPercentIncrease: number;
  topVariants: VariantInterface[] = [];

  variantColumns = ['image', 'name'];
  topVariantsSource: MatTableDataSource<VariantInterface>;

  getSmallestThumbnail = getSmallestThumbnail;

  private topVariantIds: string[] = [];
  private analyticsSubscription: Subscription;
  private variantSubscription: Subscription;

  constructor(private admin: AdminService, private shop: ShopService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.topVariantsSource = new MatTableDataSource([]);
    const today = new Date();
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    const dayBeforeYesterday = new Date(new Date().setDate(new Date().getDate() - 2));
    today.setUTCHours(0, 0, 0, 0);
    yesterday.setUTCHours(0, 0, 0, 0);
    dayBeforeYesterday.setUTCHours(0, 0, 0, 0);
    const todayUTCId = today.getTime().toString();
    const yesterdayUTCId = yesterday.getTime().toString();
    const dayBeforeYesterdayUTCId = dayBeforeYesterday.getTime().toString();
    this.getAnalytics([todayUTCId, yesterdayUTCId, dayBeforeYesterdayUTCId]);
  }

  ngOnDestroy(): void {
    if (this.analyticsSubscription && !this.analyticsSubscription.closed) {
      this.analyticsSubscription.unsubscribe();
    }
  }

  unsubscribeVariants() {
    if (this.variantSubscription && !this.variantSubscription.closed) {
      this.variantSubscription.unsubscribe();
    }
  }

  getAnalytics(ids: string[]) {
    this.analyticsSubscription = this.admin.getAnalyticsOrderDayWise(ids).subscribe(saleData => {
      const data = saleData.filter(e => e);
      if (data && data.length > 0) {
        const sales = data.map(s => s.sale).reduce((prev, curr) => prev.concat(curr));

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterdayStart = new Date(new Date().setDate(new Date().getDate() - 1));
        const yesterdayEnd = new Date(new Date().setDate(new Date().getDate() - 1));
        yesterdayStart.setHours(0, 0, 0, 0);
        yesterdayEnd.setHours(23, 59, 59, 999);

        // ANALYTICS
        const salesToday = sales.filter(s => s.createdAt >= today.getTime());
        const salesYesterday = sales.filter(s => s.createdAt >= yesterdayStart.getTime() && s.createdAt <= yesterdayEnd.getTime());
        const totalSalesToday = salesToday.map(s => s.sale).reduce((prev, curr) => prev + curr, 0);
        const totalSalesYesterday = salesYesterday.map(s => s.sale).reduce((prev, curr) => prev + curr, 0);
        this.totalSalesToday = totalSalesToday;
        this.totalOrdersToday = salesToday.length;
        this.salePercentIncrease = percentIncrease(totalSalesYesterday, totalSalesToday);
        this.orderPercentIncrease = percentIncrease(salesYesterday.length, this.totalOrdersToday);

        // TOP Variants
        const variantIds = salesToday.map(s => s.variantId).reduce((prev, curr) => prev.concat(curr), []);
        const topVariantIds = this.getTopVariantIds(variantIds);
        if (!isBothArrEqual(topVariantIds, this.topVariantIds)) {
          this.getVariants(topVariantIds);
        }
      }
    });
  }

  getVariants(ids: string[]) {
    this.unsubscribeVariants();
    this.topVariantsLoading = true;
    this.variantSubscription = this.shop.getVariantByIds(ids).subscribe(variants => {
      this.topVariantsLoading = false;
      this.topVariants = variants.filter(e => e);
      this.topVariantsSource.data = this.topVariants;
      this.cdr.detectChanges();
    });
  }

  getTopVariantIds(ids: string[]) {
    const counts: { [key: string]: number } = {};
    ids.forEach((el) => {
      counts[el] = counts[el] ? (counts[el] += 1) : 1; // Element count
    });
    const countsSorted = Object.entries(counts)
      .sort(([_, a], [__, b]) => a - b) // sort object keys
      .reverse() // Descending order
      .slice(0, 10); // TOP 10 products
    return countsSorted.map(c => c[0]); // ids
  }

  navigateToVariant(id: string) {
    const variant = this.topVariants.find(v => v.id === id);
    const { productId } = variant;
    this.router.navigateByUrl(`${productRoute}/${productId}/${VARIANT}/${id}`);
  }

}
