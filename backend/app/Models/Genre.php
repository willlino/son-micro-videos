<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Genre extends Model
{
    use SoftDeletes, Traits\Uuid;
    protected $fillable = ['name', 'active'];
    protected $dates = ['deleted_at'];
    protected $casts = [
        'id' => 'string',
        'active' => 'boolean'
    ];
    public $incrementing = false;

    public function categories()
    {
        return $this->belongsToMany(Category::class)->withTrashed(); 
    }
}
