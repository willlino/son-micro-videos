<?php

namespace App\Http\Controllers\Api;

use App\Models\CastMember;

class CastMemberController extends BasicCrudController
{
    private $rules = [
        'name' => 'required|max:255',
        'type' => 'required',
        'active' => 'boolean'
    ];

    public function model(){
        return CastMember::class;
    }

    public function rulesStore(){
        return $this->rules;
    }

    public function rulesUpdate(){
        return $this->rules;
    }
}
