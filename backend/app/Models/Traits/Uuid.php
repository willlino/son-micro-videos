<?php

namespace App\Models\Traits;
use Ramsey\Uuid\Uuid as RamsayUuid;

trait Uuid
{
    public static function boot()
    {
        parent::boot();
        static::creating(function($obj){
            $obj->id = RamsayUuid::uuid4();
        });
    }
   
}
