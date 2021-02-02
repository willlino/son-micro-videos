<?php

namespace App\Models;

use App\ModelFilters\CategoryFilter;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use SoftDeletes, Traits\Uuid, Filterable;
    protected $fillable = ['name', 'description', 'active'];
    protected $dates = ['deleted_at', 'field'];
    protected $casts = [
        'id' => 'string',
        'active' => 'boolean'
    ];
    public $incrementing = false;

    public function modelFilter(){
        return $this->provideFilter(CategoryFilter::class);
    }
}
