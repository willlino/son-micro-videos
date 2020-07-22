<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends BasicCrudController
{
    private $rules = [
        'name' => 'required|max:255',
        'description' => 'nullable',
        'active' => 'boolean'
    ];

    public function model(){
        return Category::class;
    }

    public function rulesStore(){
        return $this->rules;
    }

    public function rulesUpdate(){
        return $this->rules;
    }
}
