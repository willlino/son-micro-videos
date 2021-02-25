<?php

namespace App\Models;

use App\ModelFilters\CastMemberFilter;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CastMember extends Model
{
    use SoftDeletes, Traits\Uuid, Filterable;

    const TYPE_DIRECTOR = 1;
    const TYPE_ACTOR = 2;

    public static $types = [
        CastMember::TYPE_DIRECTOR,
        CastMember::TYPE_ACTOR
    ];

    protected $fillable = ['name','type','active'];
    protected $dates = ['deleted_at'];
    protected $casts = [
        'id' => 'string',
        'type' => 'smallInteger',
        'active' => 'boolean'
    ];
    public $incrementing = false;

    public function modelFilter(){
        return $this->provideFilter(CastMemberFilter::class);
    }
}
