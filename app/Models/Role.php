<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
    ];

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_role');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user')
            ->withPivot('gym_id')
            ->withTimestamps();
    }

    public function givePermission(Permission|string $permission): self
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->firstOrFail();
        }

        if (!$this->permissions()->where('permissions.id', $permission->id)->exists()) {
            $this->permissions()->attach($permission->id);
            $this->load('permissions');
        }

        return $this;
    }

    public function syncPermissions(array $permissionNames): self
    {
        $permissionIds = Permission::whereIn('name', $permissionNames)->pluck('id');
        $this->permissions()->sync($permissionIds);
        $this->load('permissions');

        return $this;
    }
}
