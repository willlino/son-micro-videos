<?php 

namespace App\ModelFilters;

class GenreFilter extends DefaultModelFilter
{
    protected $sortable = ['name', 'active', 'categories_id','created_at'];

    public function search($search){
        $this->where('name', 'LIKE', "%$search%");
    }
}
