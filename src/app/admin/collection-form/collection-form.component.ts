import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-collection-form',
  templateUrl: './collection-form.component.html',
  styleUrls: ['./collection-form.component.css']
})
export class CollectionFormComponent implements OnInit {
  
  nameDanger: boolean;


  addCollectionForm: FormGroup;

  constructor(private formbuilder: FormBuilder) { }

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
  }

}
