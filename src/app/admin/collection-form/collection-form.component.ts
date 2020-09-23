import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '@services/admin/admin.service';

@Component({
  selector: 'app-collection-form',
  templateUrl: './collection-form.component.html',
  styleUrls: ['./collection-form.component.css']
})
export class CollectionFormComponent implements OnInit {

  loading = false;
  success = false;
  nameDanger: boolean;


  addCollectionForm: FormGroup;

  constructor(private formbuilder: FormBuilder, private adminService: AdminService) { }

  ngOnInit(): void {
    this.addCollectionForm = this.formbuilder.group({
      name: ['', Validators.required]
    });
  }
  get addCollectionFormControls() { return this.addCollectionForm.controls; }

  async onSubmit() {
    const { name } = this.addCollectionFormControls;
    if (this.addCollectionForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }

    this.loading = true;
    try {
      await this.adminService.createCollection({
        name: name.value,

      });
      this.success = true;
      setTimeout(() => this.success = false, 2000);
    } catch (err) {
      this.success = false;
      console.log(err);
    }
    this.loading = false;
  }

}
