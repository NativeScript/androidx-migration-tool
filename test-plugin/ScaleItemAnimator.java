package com.telerik.widget.list;

import android.support.v4.view.ViewCompat;
import android.support.v4.view.ViewPropertyAnimatorCompat;
import android.support.v7.widget.RecyclerView;
import android.view.View;

/**
 * When this ItemAnimator is used items that are added or removed items will scale.
 */
public class ScaleItemAnimator extends ListViewItemAnimator {

    private static final float DEFAULT_SCALE = 0.3f;

    private float scaleX = DEFAULT_SCALE;
    private float scaleY = DEFAULT_SCALE;

    /**
     * Creates a new instance of ScaleItemAnimator.
     */
    public ScaleItemAnimator() {
    }

    /**
     * Gets the current scale for the x value of the items that are added or removed.
     * The scaleX is the start x value for added items and end x value for the removed items.
     *
     * Default is <code>0.3f</code>
     */
    public float getScaleX() {
        return scaleX;
    }

    /**
     * Sets a new scale for the x value of the items that are added or removed.
     * The scaleX is the start x value for added items and end x value for the removed items.
     *
     * Default is <code>0.3f</code>
     */
    public void setScaleX(float scaleX) {
        this.scaleX = scaleX;
    }

    /**
     * Gets the current scale for the y value of the items that are added or removed.
     * The scaleY is the start y value for added items and end y value for the removed items.
     *
     * Default is <code>0.3f</code>
     */
    public float getScaleY() {
        return scaleY;
    }

    /**
     * Sets a new scale for the y value of the items that are added or removed.
     * The scaleY is the start y value for added items and end y value for the removed items.
     *
     * Default is <code>0.3f</code>
     */
    public void setScaleY(float scaleY) {
        this.scaleY = scaleY;
    }

    @Override
    protected void animateViewAddedPrepare(RecyclerView.ViewHolder holder) {
        if((getType() & ADD) != ADD) {
            return;
        }

        View animatedView = holder.itemView;

        ViewCompat.setAlpha(animatedView, 0);
        ViewCompat.setScaleX(animatedView, scaleX);
        ViewCompat.setScaleY(animatedView, scaleY);
    }

    @Override
    protected ViewPropertyAnimatorCompat addAnimation(final RecyclerView.ViewHolder holder) {
        if((getType() & ADD) != ADD) {
            return super.addAnimation(holder);
        }

        final View animatedView = holder.itemView;
        final ViewPropertyAnimatorCompat animation = ViewCompat.animate(animatedView);
        ViewPropertyAnimatorCompat addAnimation = animation
                .alpha(1)
                .scaleX(1)
                .scaleY(1)
                .setDuration(getAddDuration());
        return addAnimation;
    }

    @Override
    protected void onAnimationAddCancelled(RecyclerView.ViewHolder holder) {
        if((getType() & ADD) != ADD) {
            super.onAnimationAddCancelled(holder);
            return;
        }

        View view = holder.itemView;
        ViewCompat.setAlpha(view, 1);
        ViewCompat.setScaleX(view, 1);
        ViewCompat.setScaleY(view, 1);
    }

    @Override
    protected void onAnimationAddEnded(ViewPropertyAnimatorCompat animation, RecyclerView.ViewHolder holder) {
        super.onAnimationAddEnded(animation, holder);
        if((getType() & ADD) != ADD) {
            return;
        }

        View view = holder.itemView;
        ViewCompat.setAlpha(view, 1);
        ViewCompat.setScaleX(view, 1);
        ViewCompat.setScaleY(view, 1);
    }

    @Override
    protected ViewPropertyAnimatorCompat removeAnimation(final RecyclerView.ViewHolder holder) {
        if((getType() & REMOVE) != REMOVE) {
            return super.removeAnimation(holder);
        }

        View animatedView = holder.itemView;

        final ViewPropertyAnimatorCompat animation = ViewCompat.animate(animatedView);
        ViewPropertyAnimatorCompat removeAnimation = animation
                .setDuration(getRemoveDuration())
                .alpha(0)
                .scaleX(scaleX)
                .scaleY(scaleY);
        return removeAnimation;
    }

    @Override
    protected void onAnimationRemoveEnded(ViewPropertyAnimatorCompat animation, RecyclerView.ViewHolder holder) {
        super.onAnimationRemoveEnded(animation, holder);

        if((getType() & REMOVE) != REMOVE) {
            return;
        }

        View view = holder.itemView;

        ViewCompat.setAlpha(view, 1);
        ViewCompat.setScaleX(view, 1);
        ViewCompat.setScaleY(view, 1);
    }

    @Override
    public void endAnimation(RecyclerView.ViewHolder holder) {
        super.endAnimation(holder);

        View view = holder.itemView;

        ViewCompat.setAlpha(view, 1);
        ViewCompat.setScaleX(view, 1);
        ViewCompat.setScaleY(view, 1);
    }

    @Override
    protected void onEndAnimation(RecyclerView.ViewHolder holder) {
        View view = holder.itemView;

        ViewCompat.setAlpha(view, 1);
        ViewCompat.setScaleX(view, 1);
        ViewCompat.setScaleY(view, 1);
    }
}
