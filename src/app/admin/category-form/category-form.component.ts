import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '@services/admin/admin.service';
import { MediaService } from '@services/media/media.service';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {

  loading = false;
  success = false;
  edit= true;

  nameDanger: boolean;


  addCategoryForm: FormGroup;
  categorySubscription: Subscription;

  editorConfig = {
    editable: true,
    placeholder: 'Description',
    toolbarHiddenButtons: [
      ['insertImage'],
      ['insertVideo'],
      ['backgroundColor'],
      ['customClasses'],
      ['link'],
      ['unlink'],
      ['insertHorizontalRule'],
      ['removeFormat'],
      ['toggleEditorMode'],
      ['undo'],
      ['redo'],
      ['strikeThrough'],
      ['subscript'],
      ['superscript'],
      ['indent'],
      ['outdent'], 
      ['textColor'],
      ['fontSize'],
      ['fontName']
    ]
  };

  constructor(private formbuilder: FormBuilder, private mediaService: MediaService, private adminService: AdminService,
    private router: Router, private route: ActivatedRoute, private shopService: ShopService)
   {
    const categoryId = this.router.url.split('/').pop();
    if (categoryId !== 'add') {
      this.categorySubscription = this.shopService.getCollectionById(categoryId).subscribe(category => {
        const { name } = category;
        this.addCategoryForm.patchValue({
          name, 
        
        });
      });
    }
  }

  ngOnInit(): void {
    this.addCategoryForm = this.formbuilder.group({
      name: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    if (this.categorySubscription && !this.categorySubscription.closed) {
      this.categorySubscription.unsubscribe();
    }
  }

  get addCategoryFormControls() { return this.addCategoryForm.controls; }

  async onSubmit() {
    const { name } = this.addCategoryFormControls;
    if (this.addCategoryForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
  
  this.loading = true;
  try {
    if(this.edit=true){
      await this.adminService.updateCategory({
        name: name.value,
        
      });
    }else{
      await this.adminService.createCategory({
        name: name.value,
        
      });
    }
  
    this.success = true;
    setTimeout(() => this.success = false, 2000);
  } catch (err) {
    this.success = false;
    console.log(err);
  }
  this.loading = false;
}

}


